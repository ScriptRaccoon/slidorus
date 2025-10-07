import { update_URL_param } from './utils'

export type ChallengeConfig = {
	pieces: string
	rows: string
	cols: string
}

export type Challenge = {
	name: string
	difficulty: number
	config: ChallengeConfig
}

export type Solve = {
	challenge_name: Challenge['name']
	date: string
	moves: number
}

export function update_URL(config: ChallengeConfig) {
	const url = new URL(window.location.origin)

	update_URL_param(url, 'pieces', config.pieces)
	update_URL_param(url, 'rows', config.rows)
	update_URL_param(url, 'cols', config.cols)

	window.history.replaceState({}, '', url)
}

export function get_recorded_solves(): Solve[] {
	const solves_str = localStorage.getItem('solves') ?? '[]'
	return JSON.parse(solves_str)
}

export function record_solve(solve: Solve) {
	const solves = get_recorded_solves()
	solves.push(solve)
	localStorage.setItem('solves', JSON.stringify(solves))
}
