import { update_URL_param } from './utils'

const CONFIG_KEYS = [
	'fixed',
	'up',
	'right',
	'down',
	'left',
	'rows',
	'cols',
] as const

export type CONFIG_KEY = (typeof CONFIG_KEYS)[number]

export type GameConfig = Record<CONFIG_KEY, string>

export type Challenge = {
	name: string
	difficulty: number
	config: GameConfig
}

export function update_URL(config: GameConfig) {
	const url = new URL(window.location.origin)

	for (const key of CONFIG_KEYS) {
		update_URL_param(url, key, config[key])
	}

	window.history.replaceState({}, '', url)
}

export function get_config_from_URL(): GameConfig {
	const url = new URL(window.location.href)

	return Object.fromEntries(
		CONFIG_KEYS.map((key) => [key, url.searchParams.get(key) ?? '']),
	) as GameConfig
}
