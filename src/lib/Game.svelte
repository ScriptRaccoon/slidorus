<script lang="ts">
	import { clamp, get_changed_position, get_position, throttle } from '../utils'
	import Connector from './Connector.svelte'
	import PieceComponent from './Piece.svelte'
	import PieceEditor from './PieceEditor.svelte'
	import {
		adjust_pieces,
		check_solved,
		create_copies_horizontal,
		create_copies_vertical,
		game,
		get_connected_cols,
		get_connected_rows,
		get_pieces_in_lines,
		reduce_to_visible_pieces,
		toggle_bandage,
	} from '../game.svelte'
	import { send_toast } from './Toast.svelte'
	import { type Piece } from '../piece.svelte'

	type Props = {
		update_pieces_array: () => void
		move_count: number
		row_connections: number[][]
		col_connections: number[][]
	}

	let {
		update_pieces_array,
		move_count = $bindable(),
		row_connections = $bindable(),
		col_connections = $bindable(),
	}: Props = $props()

	let square_element = $state<HTMLDivElement | null>(null)
	let square_size = $state(0)
	let clicked_pos: { x: number; y: number } | null = null
	let move_direction: 'horizontal' | 'vertical' | null = null
	let moving_pieces: Piece[] = []
	let moving_lines: number[] = []

	let active_row = $state<number | null>(null)
	let active_col = $state<number | null>(null)

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

		if (!move_direction) detect_movement(dx, dy)
		if (!move_direction) return

		for (const piece of moving_pieces) {
			if (move_direction === 'horizontal') {
				piece.dx = dx
			} else {
				piece.dy = dy
			}
		}
	}

	function detect_movement(dx: number, dy: number) {
		const too_early = Math.abs(dx) + Math.abs(dy) < 3
		if (too_early) return

		move_direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'

		if (!square_element || !clicked_pos) return

		const square_rect = square_element.getBoundingClientRect()

		const coord = move_direction === 'horizontal' ? 'y' : 'x'
		const rect_side = move_direction === 'horizontal' ? 'top' : 'left'
		const name = move_direction === 'horizontal' ? 'Row' : 'Column'

		const moving_line = Math.floor(
			(clicked_pos[coord] - square_rect[rect_side]) * (9 / square_size),
		)
		const valid_line = clamp(moving_line, 0, 8)

		moving_lines =
			move_direction === 'horizontal'
				? get_connected_rows(row_connections, valid_line)
				: get_connected_cols(col_connections, valid_line)

		const pieces_in_lines = get_pieces_in_lines(moving_lines, coord)

		const is_blocked = pieces_in_lines.some((piece) => piece.fixed)

		if (is_blocked) {
			reset_movement()
			send_toast({
				title: `${name} ${valid_line + 1} is blocked`,
				variant: 'error',
			})
			return
		}

		move_direction === 'horizontal'
			? create_copies_horizontal(moving_lines)
			: create_copies_vertical(moving_lines)

		moving_pieces = get_pieces_in_lines(moving_lines, coord)
	}

	function handle_mouse_up(e: MouseEvent | TouchEvent) {
		if (game.state !== 'moving' || !clicked_pos) return

		const current_pos = get_changed_position(e)
		const coord = move_direction === 'horizontal' ? 'x' : 'y'
		const delta = current_pos[coord] - clicked_pos[coord]
		const delta_int = Math.round(delta * (9 / square_size))
		const valid_delta = clamp(delta_int, -10, 10)

		for (const piece of moving_pieces) {
			piece[coord] += valid_delta
		}

		reset_movement()

		if (valid_delta != 0) {
			move_count++
			handle_solved_state()
			update_pieces_array()
		}
	}

	function reset_movement() {
		reduce_to_visible_pieces()
		adjust_pieces()
		clicked_pos = null
		move_direction = null
		moving_pieces = []
		moving_lines = []
		setTimeout(() => {
			game.state = 'idle'
		}, 80)
	}

	function handle_solved_state() {
		const is_solved = check_solved()
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

	function add_connection(
		index: number,
		connections: number[][],
		active: number | null,
		set_active: (x: number | null) => void,
	) {
		if (active === null) {
			return set_active(index)
		}

		if (active === index) {
			return set_active(null)
		}

		const connection_old_1 = connections.find((c) => c.includes(active))
		const connection_old_2 = connections.find((c) => c.includes(index))

		if (!connection_old_1 && !connection_old_2) {
			connections.push([active, index])
		} else if (connection_old_1 && !connection_old_2) {
			connection_old_1.push(index)
		} else if (connection_old_2 && !connection_old_1) {
			connection_old_2.push(active)
		} else if (connection_old_1 && connection_old_2) {
			col_connections = col_connections.filter((c) => c != connection_old_2)
			connection_old_1.push(...connection_old_2)
		}

		set_active(null)
	}

	function connect_row(row: number) {
		add_connection(row, row_connections, active_row, (_row) => {
			active_row = _row
			active_col = null
		})
	}

	function connect_col(col: number) {
		add_connection(col, col_connections, active_col, (_col) => {
			active_col = _col
			active_row = null
		})
	}

	function remove_connection(connections: number[][], index: number) {
		const i = connections.findIndex((c) => c.includes(index))
		if (i >= 0) connections.splice(i, 1)
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
			toggle_bandage_down={() => toggle_bandage(piece, 'down')}
			toggle_bandage_right={() => toggle_bandage(piece, 'right')}
		></PieceEditor>
	{/each}

	{#each { length: 9 } as _, row}
		<Connector
			type="row"
			index={row}
			disabled={game.state !== 'editing'}
			active={row === active_row}
			connect={() => connect_row(row)}
			remove={() => remove_connection(row_connections, row)}
			group={row_connections.findIndex((c) => c.includes(row))}
		/>
	{/each}

	{#each { length: 9 } as _, col}
		<Connector
			type="col"
			index={col}
			disabled={game.state !== 'editing'}
			active={col === active_col}
			connect={() => connect_col(col)}
			remove={() => remove_connection(col_connections, col)}
			group={col_connections.findIndex((c) => c.includes(col))}
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
