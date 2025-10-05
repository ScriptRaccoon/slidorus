export class Move {
	type: 'row' | 'col'
	line: number
	delta: number

	constructor(type: 'row' | 'col', line: number, delta: number) {
		this.type = type
		this.line = line
		this.delta = delta
	}

	get coord() {
		return this.type == 'row' ? 'y' : 'x'
	}

	get name() {
		return this.type === 'row' ? `Row ${this.line + 1}` : `Column ${this.line + 1}`
	}

	static generate_random_move(): Move {
		const type = Math.random() < 0.5 ? 'row' : 'col'
		const line = Math.floor(Math.random() * 9)
		let delta = Math.floor(Math.random() * 17) - 8
		if (delta === 0) delta = 1
		return new Move(type, line, delta)
	}
}
