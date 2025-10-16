import { AXES, type AXIS } from './config'
import type { Piece } from './piece.svelte'
import { clamp } from './utils'

export class Move {
	axis: AXIS
	line: number
	delta: number
	moving_lines: number[]
	moving_pieces: Piece[]
	moving_copies: Piece[]

	constructor(axis: AXIS, line: number, delta: number) {
		this.axis = axis
		this.line = line
		this.delta = delta
		this.moving_lines = []
		this.moving_pieces = []
		this.moving_copies = []
	}

	get name() {
		return `${this.axis.name} ${this.line + 1}`
	}

	get is_relevant() {
		return this.delta != 0 && this.delta == Math.floor(this.delta)
	}

	get_opposite(): Move {
		return new Move(this.axis, this.line, -this.delta)
	}

	get notation(): string {
		if (this.delta > 0)
			return `${this.line + 1}${this.axis.notation}${this.delta}`
		if (this.delta < 0)
			return `${this.line + 1}${this.axis.notation}${-this.delta}'`
		return ''
	}

	static generate_from_notation(notation: string): Move | null {
		const pattern = /^[1-9][RC][1-9]'?$/
		if (!pattern.test(notation)) return null
		const line = parseInt(notation[0]) - 1
		const axis_notation = notation[1]
		const axis = axis_notation === 'R' ? AXES.HORIZONTAL : AXES.VERTICAL
		const delta_absolute = parseInt(notation[2])
		const sign = notation.length === 4 ? -1 : 1
		const delta = sign * delta_absolute
		return new Move(axis, line, delta)
	}

	static generate_random_move(): Move {
		const axis = Math.random() < 0.5 ? AXES.HORIZONTAL : AXES.VERTICAL
		const line = Math.floor(Math.random() * 9)
		let delta = Math.floor(Math.random() * 17) - 8
		if (delta === 0) delta = 1
		return new Move(axis, line, delta)
	}

	create_copies() {
		const copies: Piece[] = []
		const offsets = [1, 2, -1, -2]

		for (const piece of this.moving_pieces) {
			for (const offset of offsets) {
				const copy = piece.get_copy()
				copy[this.axis.main] += offset * 9
				copies.push(copy)
			}
		}

		this.moving_copies = copies
	}

	compute_delta(
		start: { x: number; y: number },
		end: { x: number; y: number },
		scale: number,
	) {
		const delta_float = end[this.axis.main] - start[this.axis.main]
		const delta_int = Math.round(delta_float * scale)
		this.delta = clamp(delta_int, -10, 10)
	}
}
