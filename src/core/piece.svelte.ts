import { mod } from './utils'

export class Piece {
	public readonly id: string
	public x: number
	public y: number
	public r: number
	public dx: number
	public dy: number
	public dr: number
	public readonly original_x: number
	public readonly original_y: number
	public readonly color_id: number
	public fixed: boolean
	public rotating: boolean
	public bandaged_up: boolean
	public bandaged_right: boolean
	public bandaged_down: boolean
	public bandaged_left: boolean

	public readonly rotation_step = 40

	constructor(
		x: number,
		y: number,
		color_id: number,
		original_x = x,
		original_y = y,
		r = 0,
		dr = 0,
		fixed = false,
		rotating = false,
		bandaged_up = false,
		bandaged_right = false,
		bandaged_down = false,
		bandaged_left = false,
	) {
		this.id = crypto.randomUUID()
		this.color_id = color_id
		this.x = $state(x)
		this.y = $state(y)
		this.r = $state(r)
		this.dx = $state(0)
		this.dy = $state(0)
		this.dr = $state(dr)
		this.original_x = original_x
		this.original_y = original_y
		this.fixed = $state(fixed)
		this.rotating = $state(rotating)
		this.bandaged_up = $state(bandaged_up)
		this.bandaged_right = $state(bandaged_right)
		this.bandaged_down = $state(bandaged_down)
		this.bandaged_left = $state(bandaged_left)
	}

	public get coord_index() {
		return this.original_y * 9 + this.original_x
	}

	public get is_bandaged() {
		return (
			this.bandaged_up ||
			this.bandaged_right ||
			this.bandaged_down ||
			this.bandaged_left
		)
	}

	public get is_visible() {
		return this.x >= 0 && this.x < 9 && this.y >= 0 && this.y < 9
	}

	public get has_rotation() {
		return this.rotating && this.r != 0
	}

	public get_copy(): Piece {
		return new Piece(
			this.x,
			this.y,
			this.color_id,
			this.original_x,
			this.original_y,
			this.r,
			this.dr,
			this.fixed,
			this.rotating,
			this.bandaged_up,
			this.bandaged_right,
			this.bandaged_down,
			this.bandaged_left,
		)
	}

	public toggle_behavior() {
		if (!this.fixed && !this.rotating) {
			this.fixed = true
		} else if (this.fixed) {
			this.fixed = false
			if (!this.is_bandaged) {
				this.rotating = true
			}
		} else {
			this.fixed = false
			this.rotating = false
		}
	}

	public reset() {
		this.x = this.original_x
		this.y = this.original_y
		this.r = 0
		this.dx = 0
		this.dy = 0
		this.dr = 0
	}

	public revert_edits() {
		this.bandaged_right = false
		this.bandaged_down = false
		this.bandaged_left = false
		this.bandaged_up = false
		this.fixed = false
		this.rotating = false
		this.r = 0
	}

	public move(coord: 'x' | 'y', delta: number) {
		this[coord] = mod(this[coord] + delta, 9)
	}

	public rotate(delta: number) {
		this.r = mod(this.r + delta * this.rotation_step, 360)
	}
}
