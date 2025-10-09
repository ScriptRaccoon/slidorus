import { type Challenge, type GameConfig } from './challenge'
import { FACES, type FACES_TYPE } from './config'
import { Encoder } from './encoder'
import { Grouping } from './grouping.svelte'
import { Move } from './move'
import { Piece } from './piece.svelte'
import { equal_objects, sleep } from './utils'
import challenges from '../data/challenges.json'
import { record_solve } from './solves.svelte'

export class Game {
	pieces: Piece[]
	state: 'idle' | 'moving' | 'scrambling' | 'editing'
	row_grouping: Grouping<number>
	col_grouping: Grouping<number>
	move_history: Move[]
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

		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const piece_type = 3 * row + col
				for (let y = 0; y < 3; y++) {
					for (let x = 0; x < 3; x++) {
						const piece_x = 3 * col + x
						const piece_y = 3 * row + y
						const piece = new Piece(piece_x, piece_y, piece_type)
						pieces.push(piece)
					}
				}
			}
		}

		return pieces
	}

	reset() {
		if (this.state !== 'idle') return
		for (const piece of this.pieces) {
			piece.reset_position()
		}
		this.clear_move_history()
		this.has_scrambled = false
	}

	check_solved(): boolean {
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				const block_pieces = this.pieces.filter(
					(piece) =>
						piece.x >= 3 * col &&
						piece.x < 3 * (col + 1) &&
						piece.y >= 3 * row &&
						piece.y < 3 * (row + 1),
				)
				const piece_types = new Set(
					block_pieces.map((piece) => piece.type),
				)
				if (piece_types.size > 1) return false
			}
		}

		if (this.challenge && this.has_scrambled) {
			const solve = {
				challenge_name: this.challenge.name,
				moves: this.move_count,
				date: new Date().toISOString(),
			}
			record_solve(solve)
		}

		this.has_scrambled = false

		return true
	}

	revert_edits() {
		if (this.state !== 'editing') return
		for (const piece of this.pieces) {
			piece.revert_edits()
		}
		this.row_grouping.reset()
		this.col_grouping.reset()
	}

	adjust_pieces() {
		for (const piece of this.pieces) {
			piece.adjust()
		}
	}

	toggle_bandage(piece: Piece, direction: 'right' | 'down') {
		const other_direction = direction === 'right' ? 'left' : 'up'
		const x = direction === 'right' ? 'x' : 'y'
		const y = direction === 'right' ? 'y' : 'x'

		piece[`bandaged_${direction}`] = !piece[`bandaged_${direction}`]
		const adjacent_piece = this.pieces.find(
			(p) => p[x] === (piece[x] + 1) % 9 && p[y] === piece[y],
		)

		if (adjacent_piece) {
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
				!lines.has((piece[coord] + delta + 9) % 9),
		)
		if (piece) lines.add((piece[coord] + delta + 9) % 9)
	}

	close_lines_under_groupings(lines: Set<number>, face: FACES_TYPE) {
		if (face === FACES.ROW) {
			this.row_grouping.close(lines)
		} else {
			this.col_grouping.close(lines)
		}
	}

	get_moving_lines(move: Move): number[] {
		const lines = new Set([move.line])
		let number_connected_lines = 1

		while (lines.size < 9) {
			for (const side of move.face.sides) {
				this.close_lines_under_bandaging(lines, side)
			}
			this.close_lines_under_groupings(lines, move.face)
			if (lines.size === number_connected_lines) break
			number_connected_lines = lines.size
		}

		return Array.from(lines)
	}

	get_pieces_in_lines(lines: number[], coord: 'x' | 'y') {
		return this.pieces.filter((piece) => lines.includes(piece[coord]))
	}

	get_moving_pieces_and_lines(move: Move): [Piece[], number[]] {
		const moving_lines = this.get_moving_lines(move)
		const moving_pieces = this.get_pieces_in_lines(
			moving_lines,
			move.face.y,
		)

		const is_blocked = moving_pieces.some((piece) => piece.fixed)
		if (is_blocked) throw new Error(`${move.name} is blocked`)

		return [moving_pieces, moving_lines]
	}

	execute_move(move: Move, add_to_history = true) {
		if (move.delta === 0 || move.delta != Math.floor(move.delta)) return
		const [moving_pieces] = this.get_moving_pieces_and_lines(move)
		for (const piece of moving_pieces) {
			piece.execute_move(move)
		}
		if (add_to_history) this.move_history.push(move)
	}

	create_copies(lines: number[], face: FACES_TYPE) {
		const copies: Piece[] = []
		const offsets = [1, 2, -1, -2]

		for (let i = 0; i < 9; i++) {
			for (const line of lines) {
				const piece = this.pieces.find(
					(piece) => piece[face.x] === i && piece[face.y] === line,
				)
				if (piece) {
					for (const offset of offsets) {
						const copy = piece.get_copy()
						copy[face.x] += offset * 9
						copies.push(copy)
					}
				}
			}
		}

		this.pieces = this.pieces.concat(copies)
	}

	reduce_to_visible_pieces() {
		this.pieces = this.pieces.filter((piece) => piece.is_visible)
	}

	async scramble_pieces(wait = 0, moves = 100) {
		let attempts = 0
		for (let i = 0; i < moves; i++) {
			attempts++
			try {
				const move = Move.generate_random_move()
				this.execute_move(move, false)
				await sleep(wait)
			} catch (_) {
				if (attempts < moves * 100) i--
			}
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
			| 'bandaged_up'
			| 'bandaged_right'
			| 'bandaged_down'
			| 'bandaged_left',
	): number[] {
		return this.pieces
			.filter((piece) => piece[flag])
			.map((p) => p.coord_index)
	}

	get_config() {
		const fixed_coords = this.get_piece_coords_with_flag('fixed')
		const up_coords = this.get_piece_coords_with_flag('bandaged_up')
		const right_coords = this.get_piece_coords_with_flag('bandaged_right')
		const down_coords = this.get_piece_coords_with_flag('bandaged_down')
		const left_coords = this.get_piece_coords_with_flag('bandaged_left')

		const rows_groups = this.row_grouping.groups
		const cols_groups = this.col_grouping.groups

		return {
			fixed: Encoder.encode_subset(fixed_coords),
			up: Encoder.encode_subset(up_coords),
			right: Encoder.encode_subset(right_coords),
			down: Encoder.encode_subset(down_coords),
			left: Encoder.encode_subset(left_coords),
			rows: Encoder.encode_subsets(rows_groups),
			cols: Encoder.encode_subsets(cols_groups),
		}
	}

	load_from_config(config: GameConfig): void {
		const fixed_coords = Encoder.decode_subset(config.fixed)
		const up_coords = Encoder.decode_subset(config.up)
		const right_coords = Encoder.decode_subset(config.right)
		const down_coords = Encoder.decode_subset(config.down)
		const left_coords = Encoder.decode_subset(config.left)

		for (const piece of this.pieces) {
			piece.fixed = fixed_coords.includes(piece.coord_index)
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
		this.challenge = challenges.find((challenge) =>
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
		const last_move = this.move_history.pop()
		if (!last_move) return
		const opposite_move = last_move.get_opposite()
		this.execute_move(opposite_move, false)
	}
}

export const game = $state(new Game())
