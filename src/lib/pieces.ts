import { sleep } from '../utils'

export type Piece = {
	id: string
	x: number
	y: number
	dx: number
	dy: number
	original_x: number
	original_y: number
	type: number
	bandaged_right: boolean
	bandaged_down: boolean
	bandaged_left: boolean
	bandaged_up: boolean
	fixed: boolean
}

export function get_initial_pieces() {
	const pieces: Piece[] = []

	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			const piece_type = 3 * row + col
			for (let y = 0; y < 3; y++) {
				for (let x = 0; x < 3; x++) {
					const piece_x = 3 * col + x
					const piece_y = 3 * row + y

					const piece = {
						id: crypto.randomUUID(),
						x: piece_x,
						y: piece_y,
						dx: 0,
						dy: 0,
						original_x: piece_x,
						original_y: piece_y,
						type: piece_type,
						bandaged_right: false,
						bandaged_down: false,
						bandaged_left: false,
						bandaged_up: false,
						fixed: false,
					}
					pieces.push(piece)
				}
			}
		}
	}

	return pieces
}

export function reset_pieces(pieces: Piece[]) {
	for (const piece of pieces) {
		piece.x = piece.original_x
		piece.y = piece.original_y
		piece.dx = 0
		piece.dy = 0
	}
}

function get_copy(piece: Piece): Piece {
	return {
		id: crypto.randomUUID(),
		x: piece.x,
		y: piece.y,
		dx: piece.dx,
		dy: piece.dy,
		original_x: piece.original_x,
		original_y: piece.original_y,
		type: piece.type,
		bandaged_right: piece.bandaged_right,
		bandaged_down: piece.bandaged_down,
		bandaged_left: piece.bandaged_left,
		bandaged_up: piece.bandaged_up,
		fixed: piece.fixed,
	}
}

export function create_piece_array(pieces: Piece[]): Piece[][] {
	const result: Piece[][] = []
	for (const piece of pieces) {
		if (!result[piece.y]) result[piece.y] = []
		result[piece.y][piece.x] = piece
	}
	return result
}

export function check_solved(pieces: Piece[]): boolean {
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			const block_pieces = pieces.filter(
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

export function revert_pieces_edits(pieces: Piece[]) {
	for (const piece of pieces) {
		piece.bandaged_right = false
		piece.bandaged_down = false
		piece.bandaged_left = false
		piece.bandaged_up = false
		piece.fixed = false
	}
}

export function toggle_fixed(piece: Piece) {
	piece.fixed = !piece.fixed
}

export function toggle_bandage(
	piece: Piece,
	pieces: Piece[],
	direction: 'right' | 'down',
) {
	switch (direction) {
		case 'right':
			piece.bandaged_right = !piece.bandaged_right
			const adjacent_piece_right = pieces.find(
				(p) => p.x === (piece.x + 1) % 9 && p.y === piece.y,
			)
			if (adjacent_piece_right) {
				adjacent_piece_right.bandaged_left = !adjacent_piece_right.bandaged_left
			}
			break
		case 'down':
			piece.bandaged_down = !piece.bandaged_down
			const adjacent_piece_down = pieces.find(
				(p) => p.x === piece.x && p.y === (piece.y + 1) % 9,
			)
			if (adjacent_piece_down) {
				adjacent_piece_down.bandaged_up = !adjacent_piece_down.bandaged_up
			}
			break
	}
}

export function get_connected_rows(
	pieces: Piece[],
	row_connections: number[][],
	row: number,
): number[] {
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
		const piece = pieces.find(
			(piece) =>
				piece.bandaged_down &&
				connected_rows.has(piece.y) &&
				!connected_rows.has((piece.y + 1) % 9),
		)
		if (piece) connected_rows.add((piece.y + 1) % 9)
		return !!piece
	}

	function close_under_bandaging_above() {
		const piece = pieces.find(
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

export function get_connected_cols(
	pieces: Piece[],
	col_connections: number[][],
	col: number,
): number[] {
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
		const piece = pieces.find(
			(piece) =>
				piece.bandaged_right &&
				connected_cols.has(piece.x) &&
				!connected_cols.has((piece.x + 1) % 9),
		)
		if (piece) connected_cols.add((piece.x + 1) % 9)
		return !!piece
	}

	function close_under_bandaging_left() {
		const piece = pieces.find(
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

export function create_copies_horizontal(
	pieces: Piece[],
	moving_rows: number[],
): Piece[] {
	const copies: Piece[] = []
	const offsets = [1, 2, -1, -2]

	for (let x = 0; x < 9; x++) {
		for (const moving_row of moving_rows) {
			const piece_in_row = pieces.find(
				(piece) => piece.x === x && piece.y === moving_row,
			)
			if (piece_in_row) {
				for (const offset of offsets) {
					const copy = get_copy(piece_in_row)
					copy.x += offset * 9
					copies.push(copy)
				}
			}
		}
	}

	return copies
}

export function create_copies_vertical(pieces: Piece[], moving_cols: number[]): Piece[] {
	const copies: Piece[] = []
	const offsets = [1, 2, -1, -2]

	for (let y = 0; y < 9; y++) {
		for (const moving_col of moving_cols) {
			const piece_in_col = pieces.find(
				(piece) => piece.x === moving_col && piece.y === y,
			)

			if (piece_in_col) {
				for (const offset of offsets) {
					const copy = get_copy(piece_in_col)
					copy.y += offset * 9
					copies.push(copy)
				}
			}
		}
	}

	return copies
}

export function get_visible_pieces(pieces: Piece[]): Piece[] {
	return pieces.filter(
		(piece) => piece.x >= 0 && piece.x < 9 && piece.y >= 0 && piece.y < 9,
	)
}

function execute_row_move(
	pieces: Piece[],
	row_connections: number[][],
	row: number,
	delta: number,
) {
	if (delta === 0 || delta != Math.floor(delta)) return
	const affected_rows = get_connected_rows(pieces, row_connections, row)
	const affected_pieces = pieces.filter((piece) => affected_rows.includes(piece.y))
	const is_blocked = affected_pieces.some((piece) => piece.fixed)
	if (is_blocked) throw new Error('Row move is not possible because of a fixed piece')
	for (const piece of affected_pieces) {
		piece.x = (piece.x + delta + 9) % 9
	}
}

function execute_col_move(
	pieces: Piece[],
	col_connections: number[][],
	col: number,
	delta: number,
) {
	if (delta === 0 || delta != Math.floor(delta)) return
	const affected_cols = get_connected_cols(pieces, col_connections, col)
	const affected_pieces = pieces.filter((piece) => affected_cols.includes(piece.x))
	const is_blocked = affected_pieces.some((piece) => piece.fixed)
	if (is_blocked)
		throw new Error('Column move is not possible because of a fixed piece')
	for (const piece of affected_pieces) {
		piece.y = (piece.y + delta + 9) % 9
	}
}

function execute_random_move(
	pieces: Piece[],
	row_connections: number[][],
	col_connections: number[][],
) {
	const is_horizontal = Math.random() < 0.5
	const index = Math.floor(Math.random() * 9)
	let delta = Math.floor(Math.random() * 17) - 8
	if (delta === 0) delta = 1
	if (is_horizontal) {
		execute_row_move(pieces, row_connections, index, delta)
	} else {
		execute_col_move(pieces, col_connections, index, delta)
	}
}

export async function scramble_pieces(
	pieces: Piece[],
	row_connections: number[][],
	col_connections: number[][],
	wait = 0,
	moves = 100,
) {
	let attempts = 0
	for (let i = 0; i < moves; i++) {
		attempts++
		try {
			execute_random_move(pieces, row_connections, col_connections)
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
export function encode_pieces(pieces: Piece[]): string {
	return pieces
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
export function decode_config(config: string): Piece[] {
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

		const id = crypto.randomUUID()
		const x = index % 9
		const y = Math.floor(index / 9)
		const type = Math.floor(x / 3) + Math.floor(y / 3) * 3

		const piece: Piece = {
			id,
			x,
			y,
			original_x: x,
			original_y: y,
			dx: 0,
			dy: 0,
			type,
			fixed: Boolean(flags & 0b10000),
			bandaged_up: Boolean(flags & 0b01000),
			bandaged_right: Boolean(flags & 0b00100),
			bandaged_down: Boolean(flags & 0b00010),
			bandaged_left: Boolean(flags & 0b00001),
		}

		result.push(piece)
		seen.add(index)
	}

	for (let y = 0; y < 9; y++) {
		for (let x = 0; x < 9; x++) {
			const index = y * 9 + x
			if (seen.has(index)) continue

			const id = crypto.randomUUID()
			const type = Math.floor(x / 3) + Math.floor(y / 3) * 3

			const piece: Piece = {
				id,
				x,
				y,
				original_x: x,
				original_y: y,
				dx: 0,
				dy: 0,
				type,
				fixed: false,
				bandaged_up: false,
				bandaged_right: false,
				bandaged_down: false,
				bandaged_left: false,
			}

			result.push(piece)
		}
	}

	return result
}
