<script lang="ts">
	import {
		clamp,
		get_changed_position,
		get_position,
		throttle,
	} from '../core/utils'
	import Connector from './Connector.svelte'
	import PieceComponent from './Piece.svelte'
	import PieceEditor from './PieceEditor.svelte'
	import { send_toast } from './Toast.svelte'
	import { game } from '../core/game.svelte'
	import { Move } from '../core/move'
	import {
		COL_KEYS,
		AXES,
		ROW_KEYS,
		TRANSITION_DURATION,
	} from '../core/config'
	import MoveHistory from './MoveHistory.svelte'

	let square_element = $state<HTMLDivElement | null>(null)
	let square_size = $state(0)

	let move_pos: { x: number; y: number } | null = null
	let current_move = $state<Move | null>(null)

	let clicked_row = $state<number | null>(null)
	let clicked_col = $state<number | null>(null)

	function start_dragging(e: MouseEvent | TouchEvent) {
		if (game.state !== 'idle' || !square_element || current_move) return
		move_pos = get_position(e)
	}

	function handle_dragging(e: MouseEvent | TouchEvent) {
		if (!move_pos || !square_element) return

		const current_pos = get_position(e)

		const offset = {
			x: current_pos.x - move_pos.x,
			y: current_pos.y - move_pos.y,
		}

		const is_far_enough = Math.abs(offset.x) + Math.abs(offset.y) > 3

		if (!current_move && is_far_enough) {
			initialize_move(offset.x, offset.y)
		}

		if (current_move && current_move.delta === 0) {
			game.update_offsets(current_move, offset[current_move.axis.main])
		}
	}

	function initialize_move(dx: number, dy: number) {
		if (current_move || !move_pos || !square_element) return

		const axis =
			Math.abs(dx) > Math.abs(dy) ? AXES.HORIZONTAL : AXES.VERTICAL

		const square_rect = square_element.getBoundingClientRect()
		const moving_line = Math.floor(
			(move_pos[axis.cross] - square_rect[axis.side]) * (9 / square_size),
		)
		const line = clamp(moving_line, 0, 8)
		const move = new Move(axis, line, 0)

		const { error } = game.prepare_move(move)

		if (error) {
			send_toast({ variant: 'error', title: error })
			reset_dragging()
			return
		}

		game.state = 'moving'
		current_move = move
		move.create_copies()
	}

	function stop_dragging(e: MouseEvent | TouchEvent) {
		if (game.state !== 'moving' || !move_pos || !current_move) return

		const current_pos = get_changed_position(e)

		const delta_float =
			current_pos[current_move.axis.main] -
			move_pos[current_move.axis.main]
		const delta_int = Math.round(delta_float * (9 / square_size))
		const delta = clamp(delta_int, -10, 10)
		current_move.delta = delta

		game.update_offsets(current_move, delta * (square_size / 9))

		setTimeout(() => {
			if (current_move) game.execute_move(current_move)
			reset_dragging()
			if (delta != 0) finish_move()
		}, TRANSITION_DURATION)
	}

	function reset_dragging() {
		if (current_move) {
			game.update_offsets(current_move, 0)
		}
		current_move = null
		move_pos = null
		game.state = 'idle'
	}

	function finish_move() {
		if (!game.has_scrambled) return
		const is_solved = game.check_solved()

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
			reset_dragging()
		}

		const delta = e.shiftKey ? -1 : 1
		const row = ROW_KEYS.findIndex((row) => row === e.code)
		const col = COL_KEYS.findIndex((col) => col === e.code)
		if (row < 0 && col < 0) return

		const move =
			row >= 0
				? new Move(AXES.HORIZONTAL, row, delta)
				: new Move(AXES.VERTICAL, col, delta)

		const { error } = game.prepare_move(move)

		if (error) {
			send_toast({
				variant: 'error',
				title: error,
			})
			return
		}

		game.execute_move(move)
		finish_move()
	}

	function connect_row(row: number) {
		if (clicked_row === null) {
			clicked_row = row
			return
		}

		if (clicked_row === row) {
			clicked_row = null
			return
		}

		game.row_grouping.merge(clicked_row, row)

		clicked_row = null
	}

	function disconnect_row(row: number) {
		game.row_grouping.remove_group(row)
	}

	function connect_col(col: number) {
		if (clicked_col === null) {
			clicked_col = col
			return
		}

		if (clicked_col === col) {
			clicked_col = null
			return
		}

		game.col_grouping.merge(clicked_col, col)

		clicked_col = null
	}

	function disconnect_col(col: number) {
		game.col_grouping.remove_group(col)
	}
</script>

<svelte:window onkeydown={handle_keydown} />

<div class="game" style:--size="{square_size}px">
	<MoveHistory />
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="square {game.state}"
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

	<div class="row_connectors">
		{#each { length: 9 } as _, row}
			<Connector
				type="row"
				index={row}
				disabled={game.state !== 'editing'}
				active={row === clicked_row}
				connect={() => connect_row(row)}
				remove={() => disconnect_row(row)}
				group={game.row_grouping.get_group_index(row)}
			/>
		{/each}
	</div>

	<div class="col_connectors">
		{#each { length: 9 } as _, col}
			<Connector
				type="col"
				index={col}
				disabled={game.state !== 'editing'}
				active={col === clicked_col}
				connect={() => connect_col(col)}
				remove={() => disconnect_col(col)}
				group={game.col_grouping.get_group_index(col)}
			/>
		{/each}
	</div>
</div>

<style>
	.game {
		--u: calc(var(--size) / 9);
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto 1fr auto;
	}

	.row_connectors {
		grid-row: 2;
		grid-column: 2;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		padding-left: 0.5rem;
	}

	.col_connectors {
		grid-row: 3;
		grid-column: 1;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		padding-top: 0.5rem;
	}

	.square {
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
