import { FACES, type FACES_TYPE } from './config'
import type { Piece } from './piece.svelte'

export class Move {
	face: FACES_TYPE
	line: number
	delta: number
	moving_lines: number[]
	moving_pieces: Piece[]
	moving_copies: Piece[]

	constructor(face: FACES_TYPE, line: number, delta: number) {
		this.face = face
		this.line = line
		this.delta = delta
		this.moving_lines = []
		this.moving_pieces = []
		this.moving_copies = []
	}

	get name() {
		return `${this.face.name} ${this.line + 1}`
	}

	get is_relevant() {
		return this.delta != 0 && this.delta == Math.floor(this.delta)
	}

	get_opposite(): Move {
		return new Move(this.face, this.line, -this.delta)
	}

	get notation() {
		if (this.delta === 0) return ''
		if (this.delta > 0)
			return `${this.line + 1}${this.face.notation}${this.delta}`
		if (this.delta < 0)
			return `${this.line + 1}${this.face.notation}${-this.delta}'`
	}

	static generate_random_move(): Move {
		const face = Math.random() < 0.5 ? FACES.ROW : FACES.COL
		const line = Math.floor(Math.random() * 9)
		let delta = Math.floor(Math.random() * 17) - 8
		if (delta === 0) delta = 1
		return new Move(face, line, delta)
	}

	create_copies() {
		const copies: Piece[] = []
		const offsets = [1, 2, -1, -2]

		for (const piece of this.moving_pieces) {
			for (const offset of offsets) {
				const copy = piece.get_copy()
				copy[this.face.x] += offset * 9
				copies.push(copy)
			}
		}

		this.moving_copies = copies
	}
}
