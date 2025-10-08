export type Solve = {
	challenge_name: string
	date: string
	moves: number
}

let recorded_solves = $state<Solve[]>(get_stored_solves())
let solved_challenge_names = $derived([
	...new Set(recorded_solves.map((solve) => solve.challenge_name)),
])

function get_stored_solves(): Solve[] {
	const solves_str = localStorage.getItem('solves') ?? '[]'
	return JSON.parse(solves_str)
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
