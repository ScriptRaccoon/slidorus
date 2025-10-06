import { FACES, type FACES_TYPE } from './config'

export class Move {
	face: FACES_TYPE
	line: number
	delta: number

	constructor(face: FACES_TYPE, line: number, delta: number) {
		this.face = face
		this.line = line
		this.delta = delta
	}

	get name() {
		return `${this.face.name} ${this.line + 1}`
	}

	static generate_random_move(): Move {
		const face = Math.random() < 0.5 ? FACES.ROW : FACES.COL
		const line = Math.floor(Math.random() * 9)
		let delta = Math.floor(Math.random() * 17) - 8
		if (delta === 0) delta = 1
		return new Move(face, line, delta)
	}
}
