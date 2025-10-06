<script lang="ts">
	import { get_changed_position, get_position, throttle } from '../core/utils'
	import Connector from './Connector.svelte'
	import PieceComponent from './Piece.svelte'
	import PieceEditor from './PieceEditor.svelte'
	import { send_toast } from './Toast.svelte'
	import { game } from '../core/game.svelte'
	import { DragAction } from '../core/dragaction'

	let square_element = $state<HTMLDivElement | null>(null)
	let square_size = $state(0)

	let drag_action: DragAction | null = null
	let drag_pos: { x: number; y: number } | null = null

	let clicked_row = $state<number | null>(null)
	let clicked_col = $state<number | null>(null)

	function handle_mouse_down(e: MouseEvent | TouchEvent) {
		if (game.state !== 'idle' || !square_element) return
		drag_pos = get_position(e)
	}

	function handle_mouse_move(e: MouseEvent | TouchEvent) {
		if (!drag_pos || !square_element) return

		const current_pos = get_position(e)
		const dx = current_pos.x - drag_pos.x
		const dy = current_pos.y - drag_pos.y
		const is_far_enough = Math.abs(dx) + Math.abs(dy) > 3

		if (!drag_action && is_far_enough) {
			drag_action = new DragAction(
				drag_pos,
				square_element.getBoundingClientRect(),
				square_size,
				game,
			)
			try {
				drag_action.setup(dx, dy)
			} catch (err) {
				send_toast({ variant: 'error', title: (err as Error).message })
				reset_movement()
				return
			}

			game.state = 'moving'
		}

		drag_action?.apply(dx, dy)
	}

	function handle_mouse_up(e: MouseEvent | TouchEvent) {
		if (game.state !== 'moving' || !drag_action) return

		const current_pos = get_changed_position(e)
		const delta = drag_action.compute_delta(current_pos)

		drag_action.commit(delta)

		reset_movement()

		if (delta != 0) {
			handle_solved_state()
		}
	}

	function reset_movement() {
		drag_action?.cleanup()
		drag_action = null
		drag_pos = null
		setTimeout(() => {
			game.state = 'idle'
		}, 80) // transition duration
	}

	function handle_solved_state() {
		const is_solved = game.check_solved()
		if (is_solved) {
			send_toast({
				title: 'Puzzle solved!',
				variant: 'success',
			})
		}
	}

	function handle_keydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && game.state === 'moving') {
			reset_movement()
		}
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
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="square {game.state}"
		bind:this={square_element}
		bind:clientWidth={square_size}
		onmousedown={handle_mouse_down}
		onmousemove={throttle(handle_mouse_move, 1000 / 60)}
		onmouseup={handle_mouse_up}
		onmouseleave={handle_mouse_up}
		ontouchstart={handle_mouse_down}
		ontouchmove={throttle(handle_mouse_move, 1000 / 60)}
		ontouchend={handle_mouse_up}
	>
		{#each game.pieces as piece (piece.id)}
			<PieceComponent {piece} animated={game.state === 'moving'} />
		{/each}
	</div>

	{#each game.pieces as piece (piece.id)}
		<PieceEditor
			disabled={game.state !== 'editing'}
			{piece}
			toggle_bandage_down={() => game.toggle_bandage(piece, 'down')}
			toggle_bandage_right={() => game.toggle_bandage(piece, 'right')}
		></PieceEditor>
	{/each}

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

<style>
	.game {
		position: relative;
		--u: calc(var(--size) / 9);

		@media (max-width: 720px) {
			padding-right: calc(0.25 * var(--u));
			margin-left: calc(-0.1 * var(--u));
		}
	}

	.square {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		margin-inline: auto;
		--border: 1px;
		cursor: move;
		touch-action: none;
		clip-path: inset(var(--border));
		overflow: hidden;

		@media (min-width: 720px) {
			--border: 0.1rem;
		}

		&.editing {
			cursor: default;
		}
	}
</style>
