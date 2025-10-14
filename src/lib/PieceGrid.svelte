<script lang="ts">
	import { AXES, COL_KEYS, ROW_KEYS } from '../core/config'
	import { game } from '../core/game.svelte'
	import { Move } from '../core/move'
	import {
		clamp,
		get_changed_position,
		get_position,
		throttle,
	} from '../core/utils'

	import PieceComponent from './Piece.svelte'
	import PieceEditor from './PieceEditor.svelte'
	import { send_toast } from './Toast.svelte'

	let { square_size = $bindable() }: { square_size: number } = $props()

	let square_element = $state<HTMLDivElement | null>(null)

	let move_pos: { x: number; y: number } | null = null
	let current_move = $state<Move | null>(null)

	function start_dragging(e: MouseEvent | TouchEvent) {
		if (game.state !== 'idle' || current_move) return
		move_pos = get_position(e)
	}

	function handle_dragging(e: MouseEvent | TouchEvent) {
		if (!move_pos) return

		const current_pos = get_position(e)

		const offset = {
			x: current_pos.x - move_pos.x,
			y: current_pos.y - move_pos.y,
		}

		const is_far_enough = Math.abs(offset.x) + Math.abs(offset.y) > 3

		if (!current_move && is_far_enough) {
			initialize_move(offset.x, offset.y)
		} else if (current_move?.delta === 0) {
			game.update_offsets(current_move, offset[current_move.axis.main])
		}
	}

	function initialize_move(dx: number, dy: number) {
		const move = generate_move_from_dragging(dx, dy)
		if (!move) return

		const { error } = game.prepare_move(move)

		if (error) {
			send_toast({ variant: 'error', title: error })
			reset_current_move()
			return
		}

		set_current_move(move)
	}

	function generate_move_from_dragging(dx: number, dy: number): Move | null {
		if (!move_pos || !square_element) return null
		const axis =
			Math.abs(dx) > Math.abs(dy) ? AXES.HORIZONTAL : AXES.VERTICAL
		const square_rect = square_element.getBoundingClientRect()
		const moving_line = Math.floor(
			(move_pos[axis.cross] - square_rect[axis.side]) * (9 / square_size),
		)
		const line = clamp(moving_line, 0, 8)
		return new Move(axis, line, 0)
	}

	function set_current_move(move: Move) {
		game.state = 'moving'
		current_move = move
		move.create_copies()
	}

	function stop_dragging(e: MouseEvent | TouchEvent) {
		if (game.state !== 'moving' || !move_pos || !current_move) return
		const current_pos = get_changed_position(e)
		current_move.compute_delta(move_pos, current_pos, 9 / square_size)
		animate_move(current_move)
	}

	function animate_move(move: Move) {
		game.update_offsets(move, move.delta * (square_size / 9))

		square_element?.addEventListener(
			'transitionend',
			() => {
				game.execute_move(move)
				reset_current_move()
				if (move.delta != 0) check_solved()
			},
			{ once: true },
		)
	}

	function reset_current_move() {
		if (current_move) game.update_offsets(current_move, 0)
		current_move = null
		move_pos = null
		game.state = 'idle'
	}

	function check_solved() {
		const is_solved = game.has_scrambled && game.is_solved()

		if (is_solved) {
			game.save_solve()
			send_toast({
				title: 'Puzzle solved!',
				variant: 'success',
			})
		}
	}

	function handle_keydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && game.state === 'moving') {
			reset_current_move()
		}

		if (current_move || game.state !== 'idle') return

		const move = create_move_from_key(e)
		if (!move) return

		const { error } = game.prepare_move(move)

		if (error) {
			send_toast({
				variant: 'error',
				title: error,
			})
			return
		}

		set_current_move(move)

		setTimeout(() => {
			animate_move(move)
		}, 0)
	}

	function create_move_from_key(e: KeyboardEvent) {
		const delta = e.shiftKey ? -1 : 1
		const row = ROW_KEYS.findIndex((row) => row === e.code)
		const col = COL_KEYS.findIndex((col) => col === e.code)
		if (row < 0 && col < 0) return null

		return row >= 0
			? new Move(AXES.HORIZONTAL, row, delta)
			: new Move(AXES.VERTICAL, col, delta)
	}
</script>

<svelte:window onkeydown={handle_keydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="piece-grid {game.state}"
	bind:this={square_element}
	bind:clientWidth={square_size}
	onmousedown={start_dragging}
	onmousemove={throttle(handle_dragging, 1000 / 60)}
	onmouseup={stop_dragging}
	onmouseleave={stop_dragging}
	ontouchstart={start_dragging}
	ontouchmove={throttle(handle_dragging, 1000 / 60)}
	ontouchend={stop_dragging}
>
	{#each [...game.pieces, ...(current_move?.moving_copies ?? [])] as piece (piece.id)}
		<PieceComponent
			{piece}
			animated={game.state === 'moving'}
			dx={piece.dx}
			dy={piece.dy}
			editing={game.state === 'editing'}
		/>
	{/each}

	{#each game.pieces as piece (piece.id)}
		<PieceEditor
			disabled={game.state !== 'editing'}
			{piece}
			toggle_bandage_down={() => game.toggle_bandage(piece, 'down')}
			toggle_bandage_right={() => game.toggle_bandage(piece, 'right')}
		></PieceEditor>
	{/each}
</div>

<style>
	.piece-grid {
		grid-column: 1;
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		margin-inline: auto;
		--border: 1px;
		cursor: move;
		touch-action: none;

		&:not(.editing) {
			clip-path: inset(var(--border));
			overflow: hidden;
		}

		&.editing {
			cursor: default;
		}

		@media (min-width: 720px) {
			--border: 0.1rem;
		}
	}
</style>
