import { Move } from './move'
import { Piece } from './piece.svelte'
import { decode_sets, encode_sets, sleep } from './utils'

class Game {
	pieces: Piece[]
	state: 'idle' | 'moving' | 'scrambling' | 'editing'
	row_connections: number[][]
	col_connections: number[][]
	pieces_array: Piece[][]
	move_count: number

	constructor() {
		this.pieces = $state(this.get_initial_pieces())
		this.state = $state('idle')
		this.row_connections = $state([])
		this.col_connections = $state([])
		this.pieces_array = $state(this.create_piece_array())
		this.move_count = 0
	}

	get_initial_pieces(): Piece[] {
		const pieces: Piece[] = []

		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const piece_type = 3 * row + col
				for (let y = 0; y < 3; y++) {
					for (let x = 0; x < 3; x++) {
						const piece_x = 3 * col + x
						const piece_y = 3 * row + y
						const piece = new Piece(piece_x, piece_y, piece_type)
						pieces.push(piece)
					}
				}
			}
		}

		return pieces
	}

	reset() {
		if (this.state !== 'idle') return
		for (const piece of this.pieces) {
			piece.reset_position()
		}
		this.update_pieces_array()
		this.move_count = 0
	}

	create_piece_array(): Piece[][] {
		const result: Piece[][] = []
		for (const piece of this.pieces) {
			if (!result[piece.y]) result[piece.y] = []
			result[piece.y][piece.x] = piece
		}
		return result
	}

	// used for torus viz
	update_pieces_array() {
		this.pieces_array = this.create_piece_array()
	}

	check_solved(): boolean {
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const block_pieces = this.pieces.filter(
					(piece) =>
						piece.x >= 3 * col &&
						piece.x < 3 * (col + 1) &&
						piece.y >= 3 * row &&
						piece.y < 3 * (row + 1),
				)
				const piece_types = new Set(block_pieces.map((piece) => piece.type))
				if (piece_types.size > 1) return false
			}
		}
		return true
	}

	revert_edits() {
		if (this.state !== 'editing') return
		for (const piece of this.pieces) {
			piece.revert_edits()
		}
		this.row_connections = []
		this.col_connections = []
	}

	adjust_pieces() {
		for (const piece of this.pieces) {
			piece.adjust()
		}
	}

	toggle_bandage(piece: Piece, direction: 'right' | 'down') {
		const other_direction = direction === 'right' ? 'left' : 'up'
		const x = direction === 'right' ? 'x' : 'y'
		const y = direction === 'right' ? 'y' : 'x'

		piece[`bandaged_${direction}`] = !piece[`bandaged_${direction}`]
		const adjacent_piece = this.pieces.find(
			(p) => p[x] === (piece[x] + 1) % 9 && p[y] === piece[y],
		)

		if (adjacent_piece) {
			adjacent_piece[`bandaged_${other_direction}`] =
				!adjacent_piece[`bandaged_${other_direction}`]
		}
	}

	close_lines_under_bandaging(
		lines: Set<number>,
		direction: 'up' | 'right' | 'down' | 'left',
	) {
		const coord = ['up', 'down'].includes(direction) ? 'y' : 'x'
		const delta = ['right', 'down'].includes(direction) ? 1 : -1
		const piece = this.pieces.find(
			(piece) =>
				piece[`bandaged_${direction}`] &&
				lines.has(piece[coord]) &&
				!lines.has((piece[coord] + delta + 9) % 9),
		)
		if (piece) lines.add((piece[coord] + delta + 9) % 9)
	}

	close_lines_under_connections(lines: Set<number>, type: 'row' | 'col') {
		const connections = type === 'row' ? this.row_connections : this.col_connections
		for (const connection of connections) {
			const has_intersection = connection.some((l) => lines.has(l))
			if (has_intersection) {
				for (const l of connection) {
					lines.add(l)
				}
			}
		}
	}

	get_connected_lines(line: number, type: 'row' | 'col'): number[] {
		const lines = new Set([line])
		let number_connected_lines = 1
		while (lines.size < 9) {
			this.close_lines_under_bandaging(lines, type === 'row' ? 'up' : 'right')
			this.close_lines_under_bandaging(lines, type === 'row' ? 'down' : 'left')
			this.close_lines_under_connections(lines, type)
			if (lines.size === number_connected_lines) break
			number_connected_lines = lines.size
		}

		return Array.from(lines)
	}

	get_pieces_in_lines(lines: number[], coord: 'x' | 'y') {
		return this.pieces.filter((piece) => lines.includes(piece[coord]))
	}

	create_copies(lines: number[], type: 'row' | 'col') {
		const copies: Piece[] = []
		const offsets = [1, 2, -1, -2]
		const x = type === 'row' ? 'x' : 'y'
		const y = type === 'row' ? 'y' : 'x'

		for (let i = 0; i < 9; i++) {
			for (const line of lines) {
				const piece = this.pieces.find(
					(piece) => piece[x] === i && piece[y] === line,
				)
				if (piece) {
					for (const offset of offsets) {
						const copy = piece.get_copy()
						copy[x] += offset * 9
						copies.push(copy)
					}
				}
			}
		}

		this.pieces = this.pieces.concat(copies)
	}

	reduce_to_visible_pieces() {
		this.pieces = this.pieces.filter((piece) => piece.is_visible)
	}

	execute_move(move: Move) {
		if (move.delta === 0 || move.delta != Math.floor(move.delta)) return

		const affected_lines = this.get_connected_lines(move.line, move.type)
		const affected_pieces = this.pieces.filter((piece) =>
			affected_lines.includes(piece[move.coord]),
		)

		const is_blocked = affected_pieces.some((piece) => piece.fixed)

		if (is_blocked) throw new Error(`${move.name} is blocked`)

		for (const piece of affected_pieces) {
			piece.execute_move(move)
		}
	}

	async scramble_pieces(wait = 0, moves = 100) {
		let attempts = 0
		for (let i = 0; i < moves; i++) {
			attempts++
			try {
				const move = Move.generate_random_move()
				this.execute_move(move)
				await sleep(wait)
			} catch (_) {
				if (attempts < moves * 100) i--
			}
		}
	}

	async scramble() {
		if (this.state !== 'idle') return
		this.state = 'scrambling'
		await this.scramble_pieces(10, 100)
		this.update_pieces_array()
		this.state = 'idle'
		this.move_count = 0
	}

	/**
	 * Encodes a list of pieces into a compact base-36 string.
	 *
	 * Format per piece: 3 characters
	 * - **Coordinate (2 chars):** Each piece is located on a 9×9 grid (0–80).
	 *   The coordinate is computed as y*9 + x and encoded in base-36,
	 *   padded to 2 characters.
	 * - **Flags (1 char):** Bandaging state encoded in 5 bits:
	 *   fixed (bit 4), up (bit 3), right (bit 2), down (bit 1), left (bit 0).
	 *   This yields 0–31, stored as a single base-36 character.
	 *
	 * The final string is the concatenation of all encoded pieces.
	 *
	 * Example:
	 *   Piece at (x=6, y=5), bandaged right:
	 *   - Coordinate = 5*9 + 6 = 51 → "1f" (base-36, padded to 2 chars).
	 *   - Flags = 00100₂ = 4 → "4" (base-36).
	 *   - Encoded = "1f4".
	 */
	encode_pieces(): string {
		return this.pieces
			.filter(
				(piece) =>
					piece.fixed ||
					piece.bandaged_up ||
					piece.bandaged_right ||
					piece.bandaged_down ||
					piece.bandaged_left,
			)
			.map((piece) => {
				const coord = piece.original_y * 9 + piece.original_x
				const flags =
					(Number(piece.fixed) << 4) |
					(Number(piece.bandaged_up) << 3) |
					(Number(piece.bandaged_right) << 2) |
					(Number(piece.bandaged_down) << 1) |
					Number(piece.bandaged_left)

				const coord_str = coord.toString(36).padStart(2, '0')
				const flags_str = flags.toString(36)
				return coord_str + flags_str
			})
			.join('')
	}

	/**
	 * Decodes a configuration string produced by {@link encode_pieces}.
	 */
	decode_pieces_config(pieces_config: string) {
		const result: Piece[] = []
		const seen = new Set<number>()

		for (let i = 0; i < pieces_config.length; i += 3) {
			const coord_str = pieces_config.slice(i, i + 2)
			const flags_str = pieces_config[i + 2]

			const index = parseInt(coord_str, 36)
			const is_valid_index = index >= 0 && index < 81
			if (!is_valid_index) {
				throw new Error(`Invalid piece index: ${coord_str}`)
			}

			const flags = parseInt(flags_str, 36)
			const is_valid_flags = flags >= 0 && flags < 32
			if (!is_valid_flags) {
				throw new Error(`Invalid flags: ${flags_str}`)
			}

			const x = index % 9
			const y = Math.floor(index / 9)
			const type = Math.floor(x / 3) + Math.floor(y / 3) * 3

			const piece = $state(
				new Piece(
					x,
					y,
					type,
					x,
					y,
					Boolean(flags & 0b10000),
					Boolean(flags & 0b01000),
					Boolean(flags & 0b00100),
					Boolean(flags & 0b00010),
					Boolean(flags & 0b00001),
				),
			)

			result.push(piece)
			seen.add(index)
		}

		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				const index = y * 9 + x
				if (seen.has(index)) continue
				const type = Math.floor(x / 3) + Math.floor(y / 3) * 3
				const piece = $state(new Piece(x, y, type))
				result.push(piece)
			}
		}

		this.pieces = result
	}

	encode_row_connections() {
		return encode_sets(this.row_connections)
	}

	decode_rows_config(rows_config: string) {
		this.row_connections = decode_sets(rows_config)
	}

	encode_col_connections() {
		return encode_sets(this.col_connections)
	}

	decode_cols_config(cols_config: string) {
		this.col_connections = decode_sets(cols_config)
	}
}

export const game = $state(new Game())
