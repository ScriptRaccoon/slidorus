export const ROW_KEYS = [
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
] as const

export const COL_KEYS = [
	'KeyQ',
	'KeyW',
	'KeyE',
	'KeyR',
	'KeyT',
	'KeyY',
	'KeyU',
	'KeyI',
	'KeyO',
] as const

export const AXES = {
	HORIZONTAL: {
		name: 'Row',
		notation: 'R',
		main: 'x',
		cross: 'y',
		delta: 'dx',
		side: 'top',
		sides: ['up', 'down'],
	},
	VERTICAL: {
		name: 'Column',
		notation: 'C',
		main: 'y',
		cross: 'x',
		delta: 'dy',
		side: 'left',
		sides: ['left', 'right'],
	},
} as const

export type AXIS = (typeof AXES)[keyof typeof AXES]

export const CONFIG_KEYS = [
	'fixed',
	'rotating',
	'up',
	'right',
	'down',
	'left',
	'rows',
	'cols',
] as const

type CONFIG_KEY = (typeof CONFIG_KEYS)[number]

export type GameConfig = Record<CONFIG_KEY, string>

export type Challenge = {
	name: string
	difficulty: number
	config: GameConfig
}

export const FLAGS_MAP = [
	['fixed', 'fixed'],
	['rotating', 'rotating'],
	['up', 'bandaged_up'],
	['right', 'bandaged_right'],
	['down', 'bandaged_down'],
	['left', 'bandaged_left'],
] as const
