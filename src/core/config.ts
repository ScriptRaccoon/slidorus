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
]

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
]

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
