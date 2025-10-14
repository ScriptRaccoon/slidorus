export type Solve = {
	challenge_name: string
	date: string
	moves: number
}

let recorded_solves = $state<Solve[]>(get_stored_solves())
let solved_challenge_names = $derived([
	...new Set(recorded_solves.map((solve) => solve.challenge_name)),
])

function is_valid_solve(obj: unknown): obj is Solve {
	if (typeof obj !== 'object' || obj === null) return false
	const o = obj as Record<string, unknown>
	return (
		typeof o.challenge_name === 'string' &&
		typeof o.date === 'string' &&
		typeof o.moves === 'number'
	)
}

function get_stored_solves(): Solve[] {
	const solves_str = localStorage.getItem('solves') ?? '[]'
	const parsed_solves = JSON.parse(solves_str) as unknown
	if (Array.isArray(parsed_solves) && parsed_solves.every(is_valid_solve)) {
		return parsed_solves
	} else {
		console.error(`Invalid solves array: ${solves_str}`)
		return []
	}
}

export function record_solve(solve: Solve) {
	recorded_solves.push(solve)
	localStorage.setItem('solves', JSON.stringify(recorded_solves))
}

export function get_solved_challenge_names() {
	return solved_challenge_names
}

export function get_recorded_solves() {
	return recorded_solves
}
