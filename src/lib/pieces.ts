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
}

export function get_pieces() {
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
					}
					pieces.push(piece)
				}
			}
		}
	}

	return pieces
}

export function get_copy(piece: Piece): Piece {
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

export function unbandage_pieces(pieces: Piece[]) {
	for (const piece of pieces) {
		piece.bandaged_right = false
		piece.bandaged_down = false
		piece.bandaged_left = false
		piece.bandaged_up = false
	}
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
			if (adjacent_piece_right)
				adjacent_piece_right.bandaged_left = !adjacent_piece_right.bandaged_left
			break
		case 'down':
			piece.bandaged_down = !piece.bandaged_down
			const adjacent_piece_down = pieces.find(
				(p) => p.x === piece.x && p.y === (piece.y + 1) % 9,
			)
			if (adjacent_piece_down)
				adjacent_piece_down.bandaged_up = !adjacent_piece_down.bandaged_up
			break
	}
}

export function get_connected_rows(pieces: Piece[], row: number): number[] {
	const connected_rows: number[] = [row]

	for (let y = row; y < 9; y++) {
		const row_pieces = pieces.filter((piece) => piece.y === y)
		const is_bandaged = row_pieces.some((piece) => piece.bandaged_down)
		if (is_bandaged) {
			connected_rows.push((y + 1) % 9)
		} else {
			break
		}
	}

	for (let y = row; y >= 0; y--) {
		const row_pieces = pieces.filter((piece) => piece.y === y)
		const is_bandaged = row_pieces.some((piece) => piece.bandaged_up)
		if (is_bandaged) {
			connected_rows.push((y - 1 + 9) % 9)
		} else {
			break
		}
	}

	return connected_rows
}

export function get_connected_cols(pieces: Piece[], col: number): number[] {
	const connected_cols: number[] = [col]

	for (let x = col; x < 9; x++) {
		const col_pieces = pieces.filter((piece) => piece.x === x)
		const is_bandaged = col_pieces.some((piece) => piece.bandaged_right)
		if (is_bandaged) {
			connected_cols.push((x + 1) % 9)
		} else {
			break
		}
	}

	for (let x = col; x >= 0; x--) {
		const col_pieces = pieces.filter((piece) => piece.x === x)
		const is_bandaged = col_pieces.some((piece) => piece.bandaged_left)
		if (is_bandaged) {
			connected_cols.push((x - 1 + 9) % 9)
		} else {
			break
		}
	}

	return connected_cols
}

function execute_row_move(pieces: Piece[], row: number, delta: number) {
	if (delta === 0 || delta != Math.floor(delta)) return
	const affected_rows = get_connected_rows(pieces, row)
	for (const piece of pieces) {
		if (affected_rows.includes(piece.y)) {
			piece.x = (piece.x + delta + 9) % 9
		}
	}
}

function execute_col_move(pieces: Piece[], col: number, delta: number) {
	if (delta === 0 || delta != Math.floor(delta)) return
	const affected_cols = get_connected_cols(pieces, col)
	for (const piece of pieces) {
		if (affected_cols.includes(piece.x)) {
			piece.y = (piece.y + delta + 9) % 9
		}
	}
}

export function execute_random_move(pieces: Piece[]) {
	const is_row = Math.random() < 0.5
	const index = Math.floor(Math.random() * 9)
	let delta = Math.floor(Math.random() * 17) - 8
	if (delta === 0) delta = 1
	if (is_row) {
		execute_row_move(pieces, index, delta)
	} else {
		execute_col_move(pieces, index, delta)
	}
}

export async function scramble_pieces(pieces: Piece[], wait = 0, moves = 100) {
	for (let i = 0; i < moves; i++) {
		await sleep(wait)
		execute_random_move(pieces)
	}
}
