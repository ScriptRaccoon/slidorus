import type { Challenge } from './challenge'

export type Solve = {
	challenge_name: string
	date: string
	moves: number
}

class SolvesStorage {
	solves: Solve[]

	constructor() {
		this.solves = $state(SolvesStorage.get_stored_solves())
	}

	get solved_challenge_names(): string[] {
		return [...new Set(this.solves.map((solve) => solve.challenge_name))]
	}

	has(challenge: Challenge): boolean {
		return this.solves.some(
			(solve) => solve.challenge_name === challenge.name,
		)
	}

	store(solve: Solve) {
		this.solves.push(solve)
		localStorage.setItem('solves', JSON.stringify(this.solves))
	}

	private static is_valid_solve(obj: unknown): obj is Solve {
		if (typeof obj !== 'object' || obj === null) return false
		const o = obj as Record<string, unknown>
		return (
			typeof o.challenge_name === 'string' &&
			typeof o.date === 'string' &&
			typeof o.moves === 'number'
		)
	}

	private static get_stored_solves(): Solve[] {
		const solves_str = localStorage.getItem('solves') ?? '[]'
		const parsed_solves = JSON.parse(solves_str) as unknown
		const is_valid =
			Array.isArray(parsed_solves) &&
			parsed_solves.every(SolvesStorage.is_valid_solve)
		if (is_valid) return parsed_solves
		console.error(`Invalid solves array: ${solves_str}`)
		return []
	}
}

export const solves_storage = new SolvesStorage()
