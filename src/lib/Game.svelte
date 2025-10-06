<script lang="ts">
	import { clamp, get_changed_position, get_position, throttle } from '../core/utils'
	import Connector from './Connector.svelte'
	import PieceComponent from './Piece.svelte'
	import PieceEditor from './PieceEditor.svelte'
	import { send_toast } from './Toast.svelte'
	import { type Piece } from '../core/piece.svelte'
	import { game } from '../core/game.svelte'
	import { Move } from '../core/move'

	let square_element = $state<HTMLDivElement | null>(null)
	let square_size = $state(0)
	let clicked_pos: { x: number; y: number } | null = null
	let move_type: 'row' | 'col' | null = null
	let moving_pieces: Piece[] = []
	let moving_lines: number[] = []

	let clicked_row = $state<number | null>(null)
	let clicked_col = $state<number | null>(null)

	function handle_mouse_down(e: MouseEvent | TouchEvent) {
		if (game.state !== 'idle') return
		clicked_pos = get_position(e)
		game.state = 'moving'
	}

	function handle_mouse_move(e: MouseEvent | TouchEvent) {
		if (game.state !== 'moving' || !clicked_pos) return

		const current_pos = get_position(e)
		const dx = current_pos.x - clicked_pos.x
		const dy = current_pos.y - clicked_pos.y

		if (move_type) {
			for (const piece of moving_pieces) {
				if (move_type === 'row') {
					piece.dx = dx
				} else {
					piece.dy = dy
				}
			}
		} else {
			detect_movement(dx, dy)
		}
	}

	function detect_movement(dx: number, dy: number) {
		const too_early = Math.abs(dx) + Math.abs(dy) < 3
		if (too_early) return

		move_type = Math.abs(dx) > Math.abs(dy) ? 'row' : 'col'

		if (!square_element || !clicked_pos) return

		const square_rect = square_element.getBoundingClientRect()

		const coord = move_type === 'row' ? 'y' : 'x'
		const rect_side = move_type === 'row' ? 'top' : 'left'

		const moving_line = Math.floor(
			(clicked_pos[coord] - square_rect[rect_side]) * (9 / square_size),
		)
		const valid_line = clamp(moving_line, 0, 8)

		const move = new Move(move_type, valid_line, 0)

		moving_lines = game.get_moving_lines(move)

		let pieces_in_lines: Piece[] = []

		try {
			pieces_in_lines = game.get_moving_pieces(move)
		} catch (_) {
			reset_movement()
			send_toast({
				title: `${move.name} is blocked`,
				variant: 'error',
			})
			return
		}

		game.create_copies(moving_lines, move_type)

		moving_pieces = game.get_pieces_in_lines(moving_lines, coord)
	}

	function handle_mouse_up(e: MouseEvent | TouchEvent) {
		if (game.state !== 'moving' || !clicked_pos) return

		const current_pos = get_changed_position(e)
		const coord = move_type === 'row' ? 'x' : 'y'
		const delta_float = current_pos[coord] - clicked_pos[coord]
		const delta_int = Math.round(delta_float * (9 / square_size))
		const delta = clamp(delta_int, -10, 10)

		/** TODO: this should be done by move.execute, ok without modulo here ...... */
		for (const piece of moving_pieces) {
			piece[coord] += delta
		}

		reset_movement()

		if (delta != 0) {
			game.move_count++
			game.update_pieces_array()
			handle_solved_state()
		}
	}

	function reset_movement() {
		game.reduce_to_visible_pieces()
		game.adjust_pieces()
		clicked_pos = null
		move_type = null
		moving_pieces = []
		moving_lines = []
		setTimeout(() => {
			game.state = 'idle'
		}, 80) // transition duration
	}

	function handle_solved_state() {
		const is_solved = game.check_solved()
		if (!is_solved) return

		send_toast({
			title: 'Puzzle solved!',
			variant: 'success',
		})
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
