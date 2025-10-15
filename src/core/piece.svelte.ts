import { mod } from './utils'

export class Piece {
	id: string
	x: number
	y: number
	dx: number
	dy: number
	original_x: number
	original_y: number
	rotation: number
	dr: number
	color_id: number
	fixed: boolean
	rotating: boolean
	bandaged_up: boolean
	bandaged_right: boolean
	bandaged_down: boolean
	bandaged_left: boolean

	rotation_step = 40

	constructor(
		x: number,
		y: number,
		color_id: number,
		original_x = x,
		original_y = y,
		rotation = 0,
		dr = 0,
		fixed = false,
		rotating = false,
		bandaged_up = false,
		bandaged_right = false,
		bandaged_down = false,
		bandaged_left = false,
	) {
		this.id = crypto.randomUUID()
		this.x = $state(x)
		this.y = $state(y)
		this.dx = $state(0)
		this.dy = $state(0)
		this.color_id = color_id
		this.original_x = original_x
		this.original_y = original_y
		this.rotation = $state(rotation)
		this.dr = $state(dr)
		this.fixed = $state(fixed)
		this.rotating = $state(rotating)
		this.bandaged_up = $state(bandaged_up)
		this.bandaged_right = $state(bandaged_right)
		this.bandaged_down = $state(bandaged_down)
		this.bandaged_left = $state(bandaged_left)
	}

	get coord_index() {
		return this.original_y * 9 + this.original_x
	}

	get_copy(): Piece {
		return new Piece(
			this.x,
			this.y,
			this.color_id,
			this.original_x,
			this.original_y,
			this.rotation,
			this.dr,
			this.fixed,
			this.rotating,
			this.bandaged_up,
			this.bandaged_right,
			this.bandaged_down,
			this.bandaged_left,
		)
	}

	toggle_behavior() {
		if (!this.fixed && !this.rotating) {
			this.fixed = true
		} else if (this.fixed) {
			this.fixed = false
			this.rotating = true
		} else {
			this.fixed = false
			this.rotating = false
		}
	}

	reset() {
		this.x = this.original_x
		this.y = this.original_y
		this.rotation = 0
		this.dx = 0
		this.dy = 0
		this.dr = 0
	}

	revert_edits() {
		this.bandaged_right = false
		this.bandaged_down = false
		this.bandaged_left = false
		this.bandaged_up = false
		this.fixed = false
		this.rotating = false
		this.rotation = 0
	}

	get is_visible() {
		return this.x >= 0 && this.x < 9 && this.y >= 0 && this.y < 9
	}

	has_no_rotation() {
		return !this.rotating || this.rotation === 0
	}

	move(coord: 'x' | 'y', delta: number) {
		this[coord] = mod(this[coord] + delta, 9)
	}

	rotate(delta: number) {
		this.rotation = mod(this.rotation + delta * this.rotation_step, 360)
	}
}
