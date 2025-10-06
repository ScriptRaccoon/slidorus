import { MOVE_TYPE, type MOVE_TYPES } from './config'
import type { Game } from './game.svelte'
import { Move } from './move'
import type { Piece } from './piece.svelte'
import { clamp } from './utils'

export class DragAction {
	game: Game
	type: MOVE_TYPES | null = null
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

	setup(dx: number, dy: number) {
		this.type = Math.abs(dx) > Math.abs(dy) ? MOVE_TYPE.ROW : MOVE_TYPE.COL

		const moving_line = Math.floor(
			(this.start[this.type.y] - this.rect[this.type.side]) * (9 / this.rect_size),
		)
		const valid_line = clamp(moving_line, 0, 8)

		const move = new Move(this.type, valid_line, 0)
		const [, moving_lines] = this.game.get_moving_pieces_and_lines(move)
		this.game.create_copies(moving_lines, this.type)
		this.moving_pieces = this.game.get_pieces_in_lines(moving_lines, this.type.y)
	}

	apply(dx: number, dy: number) {
		if (this.type === MOVE_TYPE.ROW) {
			this.moving_pieces.forEach((piece) => (piece.dx = dx))
		} else if (this.type === MOVE_TYPE.COL) {
			this.moving_pieces.forEach((piece) => (piece.dy = dy))
		}
	}

	compute_delta(target: { x: number; y: number }) {
		if (!this.type) return 0
		const delta_float = target[this.type.x] - this.start[this.type.x]
		const delta_int = Math.round(delta_float * (9 / this.rect_size))
		return clamp(delta_int, -10, 10)
	}

	commit(delta: number) {
		if (!this.type) return
		for (const piece of this.moving_pieces) {
			piece[this.type.x] += delta
		}
	}

	cleanup() {
		this.game.reduce_to_visible_pieces()
		this.game.adjust_pieces()
	}
}
