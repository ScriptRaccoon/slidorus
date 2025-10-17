import { CONFIG_KEYS, type Challenge, type GameConfig } from '../core/config'
import challenges from './challenges.json'

export const CHALLENGES: Readonly<Readonly<Challenge>[]> = Object.freeze(
	challenges.map(({ name, difficulty, config }) => {
		return {
			name,
			difficulty,
			config: Object.fromEntries(
				CONFIG_KEYS.map((key) => [key, config[key] ?? '']),
			) as GameConfig,
		}
	}),
)
