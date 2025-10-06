import { FACES, type FACES_TYPE } from './config'
import type { Game } from './game.svelte'
import { Move } from './move'
import type { Piece } from './piece.svelte'
import { clamp } from './utils'

export class DragAction {
	game: Game
	face: FACES_TYPE | null = null
	start: { x: number; y: number }
	rect: DOMRect
	rect_size: number
	line: number = 0
	moving_pieces: Piece[] = []

	constructor(
		pos: { x: number; y: number },
		rect: DOMRect,
		size: number,
		game: Game,
	) {
		this.game = game
		this.start = pos
		this.rect = rect
		this.rect_size = size
	}

	setup(dx: number, dy: number) {
		this.face = Math.abs(dx) > Math.abs(dy) ? FACES.ROW : FACES.COL

		const moving_line = Math.floor(
			(this.start[this.face.y] - this.rect[this.face.side]) *
				(9 / this.rect_size),
		)
		this.line = clamp(moving_line, 0, 8)

		const move = new Move(this.face, this.line, 0)
		const [, moving_lines] = this.game.get_moving_pieces_and_lines(move)
		this.game.create_copies(moving_lines, this.face)
		this.moving_pieces = this.game.get_pieces_in_lines(
			moving_lines,
			this.face.y,
		)
	}

	apply(dx: number, dy: number) {
		if (this.face === FACES.ROW) {
			this.moving_pieces.forEach((piece) => (piece.dx = dx))
		} else if (this.face === FACES.COL) {
			this.moving_pieces.forEach((piece) => (piece.dy = dy))
		}
	}

	compute_delta(target: { x: number; y: number }) {
		if (!this.face) return 0
		const delta_float = target[this.face.x] - this.start[this.face.x]
		const delta_int = Math.round(delta_float * (9 / this.rect_size))
		return clamp(delta_int, -10, 10)
	}

	commit(delta: number) {
		if (!this.face) return

		for (const piece of this.moving_pieces) {
			piece[this.face.x] += delta
		}
		if (delta !== 0) {
			const move = new Move(this.face, this.line, delta)
			this.game.move_history.push(move)
		}

		this.cleanup()
	}

	cleanup() {
		this.game.reduce_to_visible_pieces()
		this.game.adjust_pieces()
	}
}
