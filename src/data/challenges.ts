import type { Challenge } from '../core/config'
import challenges from './challenges.json'

export const CHALLENGES: Challenge[] = challenges.map((challenge) => {
	return {
		name: challenge.name,
		difficulty: challenge.difficulty,
		config: {
			fixed: challenge.config.fixed ?? '',
			rotating: challenge.config.rotating ?? '',
			up: challenge.config.up ?? '',
			right: challenge.config.right ?? '',
			down: challenge.config.down ?? '',
			left: challenge.config.left ?? '',
			rows: challenge.config.rows ?? '',
			cols: challenge.config.cols ?? '',
		},
	}
})
