import type { Move } from './move'

export class Piece {
	id: string
	x: number
	y: number
	dx: number
	dy: number
	original_x: number
	original_y: number
	type: number
	fixed: boolean
	bandaged_up: boolean
	bandaged_right: boolean
	bandaged_down: boolean
	bandaged_left: boolean

	constructor(
		x: number,
		y: number,
		type: number,
		original_x = x,
		original_y = y,
		fixed = false,
		bandaged_up = false,
		bandaged_right = false,
		bandaged_down = false,
		bandaged_left = false,
	) {
		this.id = crypto.randomUUID()
		this.x = $state(x)
		this.y = $state(y)
		this.type = type
		this.dx = $state(0)
		this.dy = $state(0)
		this.original_x = original_x
		this.original_y = original_y
		this.fixed = $state(fixed)
		this.bandaged_up = $state(bandaged_up)
		this.bandaged_right = $state(bandaged_right)
		this.bandaged_down = $state(bandaged_down)
		this.bandaged_left = $state(bandaged_left)
	}

	get_copy(): Piece {
		return new Piece(
			this.x,
			this.y,
			this.type,
			this.original_x,
			this.original_y,
			this.fixed,
			this.bandaged_up,
			this.bandaged_right,
			this.bandaged_down,
			this.bandaged_left,
		)
	}

	toggle_fixed() {
		this.fixed = !this.fixed
	}

	reset_position() {
		this.x = this.original_x
		this.y = this.original_y
		this.dx = 0
		this.dy = 0
	}

	revert_edits() {
		this.bandaged_right = false
		this.bandaged_down = false
		this.bandaged_left = false
		this.bandaged_up = false
		this.fixed = false
	}

	adjust() {
		this.dx = 0
		this.dy = 0
	}

	execute_move(move: Move) {
		const coord = move.type === 'row' ? 'x' : 'y'
		this[coord] = (this[coord] + move.delta + 9) % 9
	}
}
