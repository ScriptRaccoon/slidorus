import { Piece } from './piece.svelte'
import { sleep } from './utils'

export const game = $state<{
	pieces: Piece[]
	state: 'idle' | 'moving' | 'scrambling' | 'editing'
}>({ pieces: get_initial_pieces(), state: 'idle' })

export function get_initial_pieces() {
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

export function reset_pieces_positions() {
	for (const piece of game.pieces) {
		piece.reset_position()
	}
}

export function create_piece_array(): Piece[][] {
	const result: Piece[][] = []
	for (const piece of game.pieces) {
		if (!result[piece.y]) result[piece.y] = []
		result[piece.y][piece.x] = piece
	}
	return result
}

export function check_solved(): boolean {
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			const block_pieces = game.pieces.filter(
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

export function revert_pieces_edits() {
	for (const piece of game.pieces) {
		piece.revert_edits()
	}
}

export function adjust_pieces() {
	for (const piece of game.pieces) {
		piece.adjust()
	}
}

export function toggle_bandage(piece: Piece, direction: 'right' | 'down') {
	switch (direction) {
		case 'right':
			piece.bandaged_right = !piece.bandaged_right
			const adjacent_piece_right = game.pieces.find(
				(p) => p.x === (piece.x + 1) % 9 && p.y === piece.y,
			)
			if (adjacent_piece_right) {
				adjacent_piece_right.bandaged_left = !adjacent_piece_right.bandaged_left
			}
			break
		case 'down':
			piece.bandaged_down = !piece.bandaged_down
			const adjacent_piece_down = game.pieces.find(
				(p) => p.x === piece.x && p.y === (piece.y + 1) % 9,
			)
			if (adjacent_piece_down) {
				adjacent_piece_down.bandaged_up = !adjacent_piece_down.bandaged_up
			}
			break
	}
}

export function get_connected_rows(row_connections: number[][], row: number): number[] {
	const connected_rows = new Set([row])

	function close_under_connections() {
		const old_size = connected_rows.size
		for (const connection of row_connections) {
			const has_intersection = connection.some((r) => connected_rows.has(r))
			if (has_intersection) {
				for (const r of connection) {
					connected_rows.add(r)
				}
			}
		}
		return connected_rows.size > old_size
	}

	function close_under_bandaging_below() {
		const piece = game.pieces.find(
			(piece) =>
				piece.bandaged_down &&
				connected_rows.has(piece.y) &&
				!connected_rows.has((piece.y + 1) % 9),
		)
		if (piece) connected_rows.add((piece.y + 1) % 9)
		return !!piece
	}

	function close_under_bandaging_above() {
		const piece = game.pieces.find(
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

export function get_connected_cols(col_connections: number[][], col: number): number[] {
	const connected_cols = new Set([col])

	function close_under_connections() {
		const old_size = connected_cols.size
		for (const connection of col_connections) {
			const has_intersection = connection.some((c) => connected_cols.has(c))
			if (has_intersection) {
				for (const r of connection) {
					connected_cols.add(r)
				}
			}
		}
		return connected_cols.size > old_size
	}

	function close_under_bandaging_right() {
		const piece = game.pieces.find(
			(piece) =>
				piece.bandaged_right &&
				connected_cols.has(piece.x) &&
				!connected_cols.has((piece.x + 1) % 9),
		)
		if (piece) connected_cols.add((piece.x + 1) % 9)
		return !!piece
	}

	function close_under_bandaging_left() {
		const piece = game.pieces.find(
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

export function get_pieces_in_lines(lines: number[], coord: 'x' | 'y') {
	return game.pieces.filter((piece) => lines.includes(piece[coord]))
}

export function create_copies_horizontal(moving_rows: number[]) {
	const copies: Piece[] = []
	const offsets = [1, 2, -1, -2]

	for (let x = 0; x < 9; x++) {
		for (const moving_row of moving_rows) {
			const piece_in_row = game.pieces.find(
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

	game.pieces = game.pieces.concat(copies)
}

export function create_copies_vertical(moving_cols: number[]) {
	const copies: Piece[] = []
	const offsets = [1, 2, -1, -2]

	for (let y = 0; y < 9; y++) {
		for (const moving_col of moving_cols) {
			const piece_in_col = game.pieces.find(
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

	game.pieces = game.pieces.concat(copies)
}

export function reduce_to_visible_pieces() {
	game.pieces = game.pieces.filter(
		(piece) => piece.x >= 0 && piece.x < 9 && piece.y >= 0 && piece.y < 9,
	)
}

export function execute_row_move(
	row_connections: number[][],
	row: number,
	delta: number,
) {
	if (delta === 0 || delta != Math.floor(delta)) return
	const affected_rows = get_connected_rows(row_connections, row)
	const affected_pieces = game.pieces.filter((piece) => affected_rows.includes(piece.y))
	const is_blocked = affected_pieces.some((piece) => piece.fixed)
	if (is_blocked) throw new Error(`Row ${row + 1} is blocked`)
	for (const piece of affected_pieces) {
		piece.x = (piece.x + delta + 9) % 9
	}
}

export function execute_col_move(
	col_connections: number[][],
	col: number,
	delta: number,
) {
	if (delta === 0 || delta != Math.floor(delta)) return
	const affected_cols = get_connected_cols(col_connections, col)
	const affected_pieces = game.pieces.filter((piece) => affected_cols.includes(piece.x))
	const is_blocked = affected_pieces.some((piece) => piece.fixed)
	if (is_blocked) throw new Error(`Column ${col + 1} is blocked`)
	for (const piece of affected_pieces) {
		piece.y = (piece.y + delta + 9) % 9
	}
}

function execute_random_move(row_connections: number[][], col_connections: number[][]) {
	const is_horizontal = Math.random() < 0.5
	const index = Math.floor(Math.random() * 9)
	let delta = Math.floor(Math.random() * 17) - 8
	if (delta === 0) delta = 1
	if (is_horizontal) {
		execute_row_move(row_connections, index, delta)
	} else {
		execute_col_move(col_connections, index, delta)
	}
}

export async function scramble_pieces(
	row_connections: number[][],
	col_connections: number[][],
	wait = 0,
	moves = 100,
) {
	let attempts = 0
	for (let i = 0; i < moves; i++) {
		attempts++
		try {
			execute_random_move(row_connections, col_connections)
			await sleep(wait)
		} catch (_) {
			if (attempts < moves * 100) i--
		}
	}
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
export function encode_pieces(): string {
	return game.pieces
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
export function decode_config(config: string) {
	const result: Piece[] = []
	const seen = new Set<number>()

	for (let i = 0; i < config.length; i += 3) {
		const coord_str = config.slice(i, i + 2)
		const flags_str = config[i + 2]

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

	game.pieces = result
}
