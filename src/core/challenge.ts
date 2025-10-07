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

export function update_URL(config: ChallengeConfig) {
	const url = new URL(window.location.origin)

	update_URL_param(url, 'pieces', config.pieces)
	update_URL_param(url, 'rows', config.rows)
	update_URL_param(url, 'cols', config.cols)

	window.history.replaceState({}, '', url)
}
