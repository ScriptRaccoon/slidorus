import type { Challenge } from './config'

export type Solve = {
	challenge_name: string
	date: string
	moves: number
}

class SolvesStorage {
	public solves: Solve[]

	constructor() {
		this.solves = $state(SolvesStorage.get_stored_solves())
	}

	public get solved_challenge_names(): string[] {
		return [...new Set(this.solves.map((solve) => solve.challenge_name))]
	}

	public has(challenge: Challenge): boolean {
		return this.solves.some(
			(solve) => solve.challenge_name === challenge.name,
		)
	}

	public store(solve: Solve) {
		this.solves.push(solve)
		localStorage.setItem('solves', JSON.stringify(this.solves))
	}

	public get_best_solves(): Solve[] {
		const best_solves: Record<string, Solve> = {}

		for (const solve of this.solves) {
			const current_record = best_solves[solve.challenge_name]
			if (current_record) {
				if (solve.moves < current_record.moves) {
					best_solves[solve.challenge_name] = solve
				}
			} else {
				best_solves[solve.challenge_name] = solve
			}
		}

		return Object.values(best_solves)
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
