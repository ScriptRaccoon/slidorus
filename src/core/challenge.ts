import { update_URL_param } from './utils'

export type GameConfig = {
	fixed: string
	up: string
	right: string
	down: string
	left: string
	rows: string
	cols: string
}

export type Challenge = {
	name: string
	difficulty: number
	config: GameConfig
}

export function update_URL(config: GameConfig) {
	const url = new URL(window.location.origin)

	update_URL_param(url, 'fixed', config.fixed)
	update_URL_param(url, 'up', config.up)
	update_URL_param(url, 'right', config.right)
	update_URL_param(url, 'down', config.down)
	update_URL_param(url, 'left', config.left)
	update_URL_param(url, 'rows', config.rows)
	update_URL_param(url, 'cols', config.cols)

	window.history.replaceState({}, '', url)
}

export function get_config_from_URL() {
	const url = new URL(window.location.href)

	return {
		fixed: url.searchParams.get('fixed') ?? '',
		up: url.searchParams.get('up') ?? '',
		right: url.searchParams.get('right') ?? '',
		down: url.searchParams.get('down') ?? '',
		left: url.searchParams.get('left') ?? '',
		rows: url.searchParams.get('rows') ?? '',
		cols: url.searchParams.get('cols') ?? '',
	}
}
