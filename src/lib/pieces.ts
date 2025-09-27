export type Piece = {
	id: string
	x: number
	y: number
	dx: number
	dy: number
	original_x: number
	original_y: number
	type: number
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
