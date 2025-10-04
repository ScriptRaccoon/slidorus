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

export function get_default_piece(x: number, y: number, type: number) {
	return {
		id: crypto.randomUUID(),
		x,
		y,
		dx: 0,
		dy: 0,
		original_x: x,
		original_y: y,
		type,
		bandaged_right: false,
		bandaged_down: false,
		bandaged_left: false,
		bandaged_up: false,
		fixed: false,
	}
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
		fixed: piece.fixed,
	}
}

export function toggle_fixed(piece: Piece) {
	piece.fixed = !piece.fixed
}

export function reset_piece_position(piece: Piece) {
	piece.x = piece.original_x
	piece.y = piece.original_y
	piece.dx = 0
	piece.dy = 0
}

export function revert_piece_edits(piece: Piece) {
	piece.bandaged_right = false
	piece.bandaged_down = false
	piece.bandaged_left = false
	piece.bandaged_up = false
	piece.fixed = false
}

export function adjust_piece(piece: Piece) {
	piece.dx = 0
	piece.dy = 0
}
