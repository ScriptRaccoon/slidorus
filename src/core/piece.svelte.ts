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
		this.dx = $state(0)
		this.dy = $state(0)
		this.type = type
		this.original_x = original_x
		this.original_y = original_y
		this.fixed = $state(fixed)
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
	}

	revert_edits() {
		this.bandaged_right = false
		this.bandaged_down = false
		this.bandaged_left = false
		this.bandaged_up = false
		this.fixed = false
	}

	get is_visible() {
		return this.x >= 0 && this.x < 9 && this.y >= 0 && this.y < 9
	}
}
