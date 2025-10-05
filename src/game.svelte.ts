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
		switch (direction) {
			case 'right':
				piece.bandaged_right = !piece.bandaged_right
				const adjacent_piece_right = this.pieces.find(
					(p) => p.x === (piece.x + 1) % 9 && p.y === piece.y,
				)
				if (adjacent_piece_right) {
					adjacent_piece_right.bandaged_left =
						!adjacent_piece_right.bandaged_left
				}
				break
			case 'down':
				piece.bandaged_down = !piece.bandaged_down
				const adjacent_piece_down = this.pieces.find(
					(p) => p.x === piece.x && p.y === (piece.y + 1) % 9,
				)
				if (adjacent_piece_down) {
					adjacent_piece_down.bandaged_up = !adjacent_piece_down.bandaged_up
				}
				break
		}
	}

	get_connected_rows(row: number): number[] {
		const connected_rows = new Set([row])

		const close_under_connections = () => {
			const old_size = connected_rows.size
			for (const connection of this.row_connections) {
				const has_intersection = connection.some((r) => connected_rows.has(r))
				if (has_intersection) {
					for (const r of connection) {
						connected_rows.add(r)
					}
				}
			}
			return connected_rows.size > old_size
		}

		const close_under_bandaging_below = () => {
			const piece = this.pieces.find(
				(piece) =>
					piece.bandaged_down &&
					connected_rows.has(piece.y) &&
					!connected_rows.has((piece.y + 1) % 9),
			)
			if (piece) connected_rows.add((piece.y + 1) % 9)
			return !!piece
		}

		const close_under_bandaging_above = () => {
			const piece = this.pieces.find(
				(piece) =>
					piece.bandaged_up &&
					connected_rows.has(piece.y) &&
					!connected_rows.has((piece.y - 1 + 9) % 9),
			)
			if (piece) connected_rows.add((piece.y - 1 + 9) % 9)
			return !!piece
		}

		while (connected_rows.size < 9) {
			const found_bandaging_below = close_under_bandaging_below()
			const found_bandaging_above = close_under_bandaging_above()
			const found_rows = close_under_connections()
			if (!found_bandaging_below && !found_bandaging_above && !found_rows) break
		}

		return Array.from(connected_rows)
	}

	get_connected_cols(col: number): number[] {
		const connected_cols = new Set([col])

		const close_under_connections = () => {
			const old_size = connected_cols.size
			for (const connection of this.col_connections) {
				const has_intersection = connection.some((c) => connected_cols.has(c))
				if (has_intersection) {
					for (const r of connection) {
						connected_cols.add(r)
					}
				}
			}
			return connected_cols.size > old_size
		}

		const close_under_bandaging_right = () => {
			const piece = this.pieces.find(
				(piece) =>
					piece.bandaged_right &&
					connected_cols.has(piece.x) &&
					!connected_cols.has((piece.x + 1) % 9),
			)
			if (piece) connected_cols.add((piece.x + 1) % 9)
			return !!piece
		}

		const close_under_bandaging_left = () => {
			const piece = this.pieces.find(
				(piece) =>
					piece.bandaged_left &&
					connected_cols.has(piece.x) &&
					!connected_cols.has((piece.x - 1 + 9) % 9),
			)
			if (piece) connected_cols.add((piece.x - 1 + 9) % 9)
			return !!piece
		}

		while (connected_cols.size < 9) {
			const found_bandaging_below = close_under_bandaging_right()
			const found_bandaging_above = close_under_bandaging_left()
			const found_rows = close_under_connections()
			if (!found_bandaging_below && !found_bandaging_above && !found_rows) break
		}

		return Array.from(connected_cols)
	}

	get_pieces_in_lines(lines: number[], coord: 'x' | 'y') {
		return this.pieces.filter((piece) => lines.includes(piece[coord]))
	}

	create_copies_horizontal(moving_rows: number[]) {
		const copies: Piece[] = []
		const offsets = [1, 2, -1, -2]

		for (let x = 0; x < 9; x++) {
			for (const moving_row of moving_rows) {
				const piece_in_row = this.pieces.find(
					(piece) => piece.x === x && piece.y === moving_row,
				)
				if (piece_in_row) {
					for (const offset of offsets) {
						const copy = piece_in_row.get_copy()
						copy.x += offset * 9
						copies.push(copy)
					}
				}
			}
		}

		this.pieces = this.pieces.concat(copies)
	}

	create_copies_vertical(moving_cols: number[]) {
		const copies: Piece[] = []
		const offsets = [1, 2, -1, -2]

		for (let y = 0; y < 9; y++) {
			for (const moving_col of moving_cols) {
				const piece_in_col = this.pieces.find(
					(piece) => piece.x === moving_col && piece.y === y,
				)

				if (piece_in_col) {
					for (const offset of offsets) {
						const copy = piece_in_col.get_copy()
						copy.y += offset * 9
						copies.push(copy)
					}
				}
			}
		}

		this.pieces = this.pieces.concat(copies)
	}

	reduce_to_visible_pieces() {
		this.pieces = this.pieces.filter(
			(piece) => piece.x >= 0 && piece.x < 9 && piece.y >= 0 && piece.y < 9,
		)
	}

	execute_move(move: Move) {
		if (move.delta === 0 || move.delta != Math.floor(move.delta)) return

		const affected_lines =
			move.type === 'row'
				? this.get_connected_rows(move.line)
				: this.get_connected_cols(move.line)

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
