import { AXES, FLAGS_MAP, type AXIS, type GameConfig } from './config'
import { Encoder } from './encoder'
import { Grouping } from './grouping.svelte'
import { Move } from './move'
import { Piece } from './piece.svelte'
import { mod } from './utils'

class Game {
	public pieces: Piece[]
	public state: 'idle' | 'moving' | 'scrambling' | 'editing'
	public row_grouping: Grouping<number>
	public col_grouping: Grouping<number>
	public move_history: string[]
	private scramble_history: string[]

	constructor() {
		this.pieces = $state(this.get_initial_pieces())
		this.state = $state('idle')
		this.row_grouping = $state(new Grouping())
		this.col_grouping = $state(new Grouping())
		this.move_history = $state([])
		this.scramble_history = []
	}

	private get_initial_pieces(): Piece[] {
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

	public reset() {
		if (this.state !== 'idle') return
		this.reset_pieces()
		this.clear_history()
	}

	public reset_pieces() {
		for (const piece of this.pieces) {
			piece.reset()
		}
	}

	public clear_history() {
		this.clear_move_history()
		this.clear_scramble_history()
	}

	public clear_move_history() {
		this.move_history = []
		this.save_move_history()
	}

	public clear_scramble_history() {
		this.scramble_history = []
		this.save_scramble_history()
	}

	public get has_scramble(): boolean {
		return this.scramble_history.length > 0
	}

	public get move_count(): number {
		return this.move_history.length
	}

	public is_solved(): boolean {
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

		return this.pieces.every((piece) => !piece.has_rotation)
	}

	public revert_edits() {
		if (this.state !== 'editing') return
		for (const piece of this.pieces) {
			piece.revert_edits()
		}
		this.row_grouping.reset()
		this.col_grouping.reset()
	}

	public toggle_bandage(piece: Piece, direction: 'right' | 'down') {
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

	public prepare_move(move: Move): { error: string | null } {
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

		const is_blocked = move.moving_pieces.some((piece) => piece.fixed)
		if (is_blocked) return { error: `${move.name} is blocked` }

		return { error: null }
	}

	private close_lines_under_bandaging(
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

	private close_lines_under_groupings(lines: Set<number>, axis: AXIS) {
		if (axis === AXES.HORIZONTAL) {
			this.row_grouping.close(lines)
		} else {
			this.col_grouping.close(lines)
		}
	}

	public execute_move(move: Move, type: 'forget' | 'move' | 'scramble') {
		if (!move.is_relevant) return

		if (type === 'move' && this.get_last_move()?.is_opposite_to(move)) {
			const { error } = this.undo_move()
			if (!error) return
		}

		for (const piece of move.moving_pieces) {
			piece.move(move.axis.main, move.delta)
			if (piece.rotating) piece.rotate(move.delta)
		}

		if (type === 'move') {
			this.move_history.push(move.notation)
			this.save_move_history()
		} else if (type == 'scramble') {
			this.scramble_history.push(move.notation)
		}
	}

	private get_last_move(): Move | null {
		const notation = this.move_history.at(-1)
		if (!notation) return null
		return Move.generate_from_notation(notation)
	}

	public update_offsets(move: Move, offset: number, scale: number) {
		for (const piece of [...move.moving_copies, ...move.moving_pieces]) {
			piece[move.axis.delta] = offset
			if (piece.rotating) {
				piece.dr = offset * scale * piece.rotation_step
			}
		}
	}

	public execute_scramble(moves = 1000) {
		if (this.state !== 'idle') return
		this.reset()
		this.state = 'scrambling'

		let moves_made = 0
		while (moves_made < moves) {
			const move = Move.generate_random_move()
			const { error } = this.prepare_move(move)
			if (error) continue
			this.execute_move(move, 'scramble')
			moves_made++
		}

		this.save_scramble_history()
		this.state = 'idle'
	}

	public get_config(): GameConfig {
		const config = {} as GameConfig

		for (const [key, val] of FLAGS_MAP) {
			const coords = this.get_flagged_coords(val)
			config[key as keyof GameConfig] = Encoder.encode_subset(coords)
		}

		config.rows = Encoder.encode_subsets(this.row_grouping.groups)
		config.cols = Encoder.encode_subsets(this.col_grouping.groups)

		return config
	}

	private get_flagged_coords(flag: keyof Piece): number[] {
		return this.pieces
			.filter((piece) => piece[flag])
			.map((p) => p.coord_index)
	}

	public load_from_config(config: GameConfig) {
		const decoded_coords: Partial<Record<keyof GameConfig, number[]>> = {}

		for (const [key, _] of FLAGS_MAP) {
			decoded_coords[key] = Encoder.decode_subset(config[key])
		}

		for (const piece of this.pieces) {
			for (const [key, val] of FLAGS_MAP) {
				const coords = decoded_coords[key]!
				piece[val] = coords.includes(piece.coord_index)
			}
		}

		this.row_grouping.groups = Encoder.decode_subsets(config.rows)
		this.col_grouping.groups = Encoder.decode_subsets(config.cols)

		this.reset_pieces()
		this.load_progress()
	}

	public undo_move(): { error: string | null } {
		const last_move = this.get_last_move()
		if (!last_move) return { error: null }
		const opposite_move = last_move.get_opposite()
		const { error } = this.prepare_move(opposite_move)
		if (error) return { error }
		this.execute_move(opposite_move, 'forget')
		this.move_history.pop()
		this.save_move_history()
		return { error: null }
	}

	private get_config_hash(): string {
		return Object.values(this.get_config()).join('_')
	}

	private save_move_history() {
		if (!this.has_scramble) return

		const hash = this.get_config_hash()
		const key = `moves:${hash}`
		if (this.move_history.length > 0) {
			localStorage.setItem(key, this.move_history.join(','))
		} else {
			localStorage.removeItem(key)
		}
	}

	private save_scramble_history() {
		const hash = this.get_config_hash()
		const key = `scramble:${hash}`
		if (this.scramble_history.length > 0) {
			localStorage.setItem(key, this.scramble_history.join(','))
		} else {
			localStorage.removeItem(key)
		}
	}

	public load_progress() {
		const hash = this.get_config_hash()
		const moves_key = `moves:${hash}`
		const scramble_key = `scramble:${hash}`
		const moves_str = localStorage.getItem(moves_key)
		const scramble_str = localStorage.getItem(scramble_key)

		if (!moves_str || !scramble_str) return this.reset()

		const confirmed = window.confirm(
			'Do you want to restore your progress for this game?',
		)
		if (!confirmed) return this.clear_history()

		const moves = moves_str.split(',')
		const scramble = scramble_str.split(',')

		this.scramble_history = []

		for (const notation of scramble) {
			const move = Move.generate_from_notation(notation)
			if (!move) {
				console.error(`Illegal move found: ${notation}`)
				return this.reset()
			}
			const { error } = this.prepare_move(move)
			if (error) {
				console.error(`Move ${notation} cannot be executed: ${error}`)
				return this.reset()
			}
			this.execute_move(move, 'scramble')
		}

		this.move_history = []

		for (const notation of moves) {
			const move = Move.generate_from_notation(notation)
			if (!move) {
				console.error(`Illegal move found: ${notation}`)
				return this.reset()
			}
			const { error } = this.prepare_move(move)
			if (error) {
				console.error(`Move ${notation} cannot be executed: ${error}`)
				return this.reset()
			}
			this.execute_move(move, 'move')
		}
	}
}

export const game = $state(new Game())
