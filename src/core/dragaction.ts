import type { Game } from './game.svelte'
import { Move } from './move'
import type { Piece } from './piece.svelte'
import { clamp } from './utils'

export class DragAction {
	game: Game
	type: 'row' | 'col' | null = null
	start: { x: number; y: number }
	rect: DOMRect
	rect_size: number
	moving_pieces: Piece[] = []

	constructor(pos: { x: number; y: number }, rect: DOMRect, size: number, game: Game) {
		this.game = game
		this.start = pos
		this.rect = rect
		this.rect_size = size
	}

	get coord() {
		return this.type == 'row' ? 'y' : 'x'
	}

	get other_coord() {
		return this.type == 'row' ? 'x' : 'y'
	}

	get side() {
		return this.type === 'row' ? 'top' : 'left'
	}

	setup(dx: number, dy: number) {
		this.type = Math.abs(dx) > Math.abs(dy) ? 'row' : 'col'

		const moving_line = Math.floor(
			(this.start[this.coord] - this.rect[this.side]) * (9 / this.rect_size),
		)
		const valid_line = clamp(moving_line, 0, 8)

		const move = new Move(this.type, valid_line, 0)
		const [, moving_lines] = this.game.get_moving_pieces_and_lines(move)
		this.game.create_copies(moving_lines, this.type)
		this.moving_pieces = this.game.get_pieces_in_lines(moving_lines, this.coord)
	}

	apply(dx: number, dy: number) {
		if (this.type === 'row') {
			this.moving_pieces.forEach((piece) => (piece.dx = dx))
		} else if (this.type === 'col') {
			this.moving_pieces.forEach((piece) => (piece.dy = dy))
		}
	}

	compute_delta(target: { x: number; y: number }) {
		const delta_float = target[this.other_coord] - this.start[this.other_coord]
		const delta_int = Math.round(delta_float * (9 / this.rect_size))
		return clamp(delta_int, -10, 10)
	}

	commit(delta: number) {
		for (const piece of this.moving_pieces) {
			piece[this.other_coord] += delta
		}
	}

	cleanup() {
		this.game.reduce_to_visible_pieces()
		this.game.adjust_pieces()
	}
}
