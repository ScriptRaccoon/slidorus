import { type Challenge, type GameConfig } from './challenge'
import { AXES, type AXIS } from './config'
import { Encoder } from './encoder'
import { Grouping } from './grouping.svelte'
import { Move } from './move'
import { Piece } from './piece.svelte'
import { equal_objects, mod, sleep } from './utils'
import { CHALLENGES } from '../data/challenges'
import { solves_storage } from './solves.svelte'

export class Game {
	pieces: Piece[]
	state: 'idle' | 'moving' | 'scrambling' | 'editing'
	row_grouping: Grouping<number>
	col_grouping: Grouping<number>
	move_history: string[]
	challenge: Challenge | undefined
	has_scrambled: boolean

	constructor() {
		this.pieces = $state(this.get_initial_pieces())
		this.state = $state('idle')
		this.row_grouping = $state(new Grouping())
		this.col_grouping = $state(new Grouping())
		this.move_history = $state([])
		this.challenge = $state(undefined)
		this.has_scrambled = $state(false)
	}

	get_initial_pieces(): Piece[] {
		const pieces: Piece[] = []

		for (let x = 0; x < 9; x++) {
			for (let y = 0; y < 9; y++) {
				const block_x = Math.floor(x / 3)
				const block_y = Math.floor(y / 3)
				const color_id = 3 * block_y + block_x
				const piece = new Piece(x, y, color_id)
				pieces.push(piece)
			}
		}

		return pieces
	}

	reset() {
		if (this.state !== 'idle') return
		for (const piece of this.pieces) {
			piece.reset()
		}
		this.clear_move_history()
		this.has_scrambled = false
	}

	is_solved(): boolean {
		for (let block_x = 0; block_x < 9; block_x += 3) {
			for (let block_y = 0; block_y < 9; block_y += 3) {
				const block_pieces = this.pieces.filter(
					(piece) =>
						piece.x >= block_x &&
						piece.x < block_x + 3 &&
						piece.y >= block_y &&
						piece.y < block_y + 3,
				)
				const color_ids = new Set(
					block_pieces.map((piece) => piece.color_id),
				)
				if (color_ids.size > 1) return false
			}
		}

		return this.pieces.every((piece) => piece.has_no_rotation())
	}

	save_solve() {
		if (this.challenge && this.has_scrambled) {
			const solve = {
				challenge_name: this.challenge.name,
				moves: this.move_count,
				date: new Date().toISOString(),
			}
			solves_storage.store(solve)
		}

		this.has_scrambled = false
	}

	revert_edits() {
		if (this.state !== 'editing') return
		for (const piece of this.pieces) {
			piece.revert_edits()
		}
		this.row_grouping.reset()
		this.col_grouping.reset()
	}

	toggle_bandage(piece: Piece, direction: 'right' | 'down') {
		if (piece.rotating) return

		const other_direction = direction === 'right' ? 'left' : 'up'
		const x = direction === 'right' ? 'x' : 'y'
		const y = direction === 'right' ? 'y' : 'x'

		const adjacent_piece = this.pieces.find(
			(p) => p[x] === mod(piece[x] + 1, 9) && p[y] === piece[y],
		)

		if (adjacent_piece && !adjacent_piece.rotating) {
			piece[`bandaged_${direction}`] = !piece[`bandaged_${direction}`]

			adjacent_piece[`bandaged_${other_direction}`] =
				!adjacent_piece[`bandaged_${other_direction}`]
		}
	}

	close_lines_under_bandaging(
		lines: Set<number>,
		direction: 'up' | 'right' | 'down' | 'left',
	) {
		const coord = ['up', 'down'].includes(direction) ? 'y' : 'x'
		const delta = ['right', 'down'].includes(direction) ? 1 : -1
		const piece = this.pieces.find(
			(piece) =>
				piece[`bandaged_${direction}`] &&
				lines.has(piece[coord]) &&
				!lines.has(mod(piece[coord] + delta, 9)),
		)
		if (piece) lines.add(mod(piece[coord] + delta, 9))
	}

	close_lines_under_groupings(lines: Set<number>, axis: AXIS) {
		if (axis === AXES.HORIZONTAL) {
			this.row_grouping.close(lines)
		} else {
			this.col_grouping.close(lines)
		}
	}

	prepare_move(move: Move) {
		const lines = new Set([move.line])
		let line_count = 1

		while (lines.size < 9) {
			for (const side of move.axis.sides) {
				this.close_lines_under_bandaging(lines, side)
			}
			this.close_lines_under_groupings(lines, move.axis)
			if (lines.size === line_count) break
			line_count = lines.size
		}

		move.moving_lines = Array.from(lines)

		move.moving_pieces = this.pieces.filter((piece) =>
			move.moving_lines.includes(piece[move.axis.cross]),
		)

		return this.verify_move(move)
	}

	verify_move(move: Move): { error: string | null } {
		for (const piece of move.moving_pieces) {
			if (piece.fixed) return { error: `${move.name} is blocked` }
		}

		return { error: null }
	}

	execute_move(move: Move, add_to_history = true) {
		if (!move.is_relevant) return

		for (const piece of move.moving_pieces) {
			piece.move(move.axis.main, move.delta)
			if (piece.rotating) piece.rotate(move.delta)
		}

		if (add_to_history) this.move_history.push(move.notation)
	}

	update_offsets(move: Move, offset: number, scale: number) {
		for (const piece of [...move.moving_copies, ...move.moving_pieces]) {
			piece[move.axis.delta] = offset
			if (piece.rotating) {
				piece.dr = offset * scale * piece.rotation_step
			}
		}
	}

	async scramble_pieces(wait = 0, moves = 100) {
		let moves_made = 0
		while (moves_made < moves) {
			const move = Move.generate_random_move()
			const { error } = this.prepare_move(move)
			if (error) continue
			this.execute_move(move, false)
			moves_made++
			await sleep(wait)
		}
	}

	async scramble() {
		if (this.state !== 'idle') return
		this.state = 'scrambling'
		await this.scramble_pieces(10, 100)
		this.state = 'idle'
		this.clear_move_history()
		this.has_scrambled = true
	}

	get_piece_coords_with_flag(
		flag:
			| 'fixed'
			| 'rotating'
			| 'bandaged_up'
			| 'bandaged_right'
			| 'bandaged_down'
			| 'bandaged_left',
	): number[] {
		return this.pieces
			.filter((piece) => piece[flag])
			.map((p) => p.coord_index)
	}

	get_config(): GameConfig {
		const fixed_coords = this.get_piece_coords_with_flag('fixed')
		const rotating_coords = this.get_piece_coords_with_flag('rotating')
		const up_coords = this.get_piece_coords_with_flag('bandaged_up')
		const right_coords = this.get_piece_coords_with_flag('bandaged_right')
		const down_coords = this.get_piece_coords_with_flag('bandaged_down')
		const left_coords = this.get_piece_coords_with_flag('bandaged_left')

		const rows_groups = this.row_grouping.groups
		const cols_groups = this.col_grouping.groups

		return {
			fixed: Encoder.encode_subset(fixed_coords),
			rotating: Encoder.encode_subset(rotating_coords),
			up: Encoder.encode_subset(up_coords),
			right: Encoder.encode_subset(right_coords),
			down: Encoder.encode_subset(down_coords),
			left: Encoder.encode_subset(left_coords),
			rows: Encoder.encode_subsets(rows_groups),
			cols: Encoder.encode_subsets(cols_groups),
		}
	}

	load_from_config(config: GameConfig) {
		this.reset()
		const fixed_coords = Encoder.decode_subset(config.fixed)
		const rotating_cords = Encoder.decode_subset(config.rotating)
		const up_coords = Encoder.decode_subset(config.up)
		const right_coords = Encoder.decode_subset(config.right)
		const down_coords = Encoder.decode_subset(config.down)
		const left_coords = Encoder.decode_subset(config.left)

		for (const piece of this.pieces) {
			piece.fixed = fixed_coords.includes(piece.coord_index)
			piece.rotating = rotating_cords.includes(piece.coord_index)
			piece.bandaged_up = up_coords.includes(piece.coord_index)
			piece.bandaged_right = right_coords.includes(piece.coord_index)
			piece.bandaged_down = down_coords.includes(piece.coord_index)
			piece.bandaged_left = left_coords.includes(piece.coord_index)
		}

		this.row_grouping.groups = Encoder.decode_subsets(config.rows)
		this.col_grouping.groups = Encoder.decode_subsets(config.cols)

		game.clear_move_history()
	}

	set_challenge(challenge: Challenge) {
		this.load_from_config(challenge.config)
		this.challenge = challenge
	}

	update_challenge() {
		const config = this.get_config()
		this.challenge = CHALLENGES.find((challenge) =>
			equal_objects(challenge.config, config),
		)
	}

	clear_move_history() {
		this.move_history = []
	}

	get move_count() {
		return this.move_history.length
	}

	undo_move() {
		const last_move_str = this.move_history.at(-1)
		if (!last_move_str) return { error: null }
		const last_move = Move.generate_from_notation(last_move_str)
		if (!last_move)
			return { error: `Invalid move notation: ${last_move_str}` }
		const opposite_move = last_move.get_opposite()
		const { error } = this.prepare_move(opposite_move)
		if (!error) this.execute_move(opposite_move, false)
		this.move_history.pop()
		return { error }
	}
}

export const game = $state(new Game())
