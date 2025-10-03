<script lang="ts">
	import { clamp, get_changed_position, get_position, throttle } from '../utils'
	import Connector from './Connector.svelte'
	import PieceComponent from './Piece.svelte'
	import PieceEditor from './PieceEditor.svelte'
	import {
		check_solved,
		create_copies_horizontal,
		create_copies_vertical,
		get_connected_cols,
		get_connected_rows,
		get_visible_pieces,
		toggle_bandage,
		toggle_fixed,
		type Piece,
	} from './pieces'
	import { send_toast } from './Toast.svelte'
	import type { APP_STATE } from './types'

	type Props = {
		pieces: Piece[]
		update_pieces_array: () => void
		app_state: APP_STATE
		move_count: number
		row_connections: number[][]
		col_connections: number[][]
	}

	let {
		pieces = $bindable(),
		update_pieces_array,
		app_state = $bindable(),
		move_count = $bindable(),
		row_connections = $bindable(),
		col_connections = $bindable(),
	}: Props = $props()

	let square_element = $state<HTMLDivElement | null>(null)
	let square_size = $state(0)
	let clicked_pos: { x: number; y: number } | null = null
	let move_direction: 'horizontal' | 'vertical' | null = null
	let moving_pieces: Piece[] = []
	let moving_rows: number[] = []
	let moving_cols: number[] = []

	let active_row = $state<number | null>(null)
	let active_col = $state<number | null>(null)

	function handle_mouse_down(e: MouseEvent | TouchEvent) {
		if (app_state !== 'idle') return
		clicked_pos = get_position(e)
		app_state = 'moving'
	}

	function handle_mouse_move(e: MouseEvent | TouchEvent) {
		if (app_state !== 'moving' || !clicked_pos) return

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

	function handle_mouse_up(e: MouseEvent | TouchEvent) {
		if (app_state !== 'moving' || !clicked_pos) return

		const current_pos = get_changed_position(e)
		let has_moved = false

		switch (move_direction) {
			case 'horizontal':
				const dx = current_pos.x - clicked_pos.x
				const dx_int = Math.round(dx * (9 / square_size))
				const valid_dx = clamp(dx_int, -10, 10)
				if (valid_dx != 0) has_moved = true
				for (const piece of moving_pieces) {
					piece.x += valid_dx
				}
				break
			case 'vertical':
				const dy = current_pos.y - clicked_pos.y
				const dy_int = Math.round(dy * (9 / square_size))
				const valid_dy = clamp(dy_int, -10, 10)
				if (valid_dy != 0) has_moved = true
				for (const piece of moving_pieces) {
					piece.y += valid_dy
				}
				break
		}

		reset_movement()

		if (has_moved) {
			move_count++
			handle_solved_state()
			update_pieces_array()
		}
	}

	function reset_movement() {
		pieces = get_visible_pieces(pieces)
		pieces.forEach((piece) => {
			piece.dx = 0
			piece.dy = 0
		})
		clicked_pos = null
		move_direction = null
		moving_pieces = []
		moving_rows = []
		moving_cols = []
		app_state = 'idle'
	}

	function handle_solved_state() {
		const is_solved = check_solved(pieces)
		if (!is_solved) return

		send_toast({
			title: 'Puzzle solved!',
			variant: 'success',
		})
	}

	function detect_movement(dx: number, dy: number) {
		const too_early = Math.abs(dx) + Math.abs(dy) < 3
		if (too_early) return

		move_direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'

		if (!square_element || !clicked_pos) return

		const square_rect = square_element.getBoundingClientRect()

		switch (move_direction) {
			case 'horizontal':
				const moving_row = Math.floor(
					(clicked_pos.y - square_rect.top) * (9 / square_size),
				)
				const valid_row = clamp(moving_row, 0, 8)
				moving_rows = get_connected_rows(pieces, row_connections, valid_row)

				const is_blocked_row = pieces.some(
					(piece) => moving_rows.includes(piece.y) && piece.fixed,
				)
				if (is_blocked_row) {
					reset_movement()
					send_toast({
						title: 'Row is blocked',
						variant: 'error',
					})
					return
				}

				const copies_in_rows = create_copies_horizontal(pieces, moving_rows)
				pieces = pieces.concat(copies_in_rows)
				moving_pieces = pieces.filter((piece) => moving_rows.includes(piece.y))
				break
			case 'vertical':
				const moving_col = Math.floor(
					(clicked_pos.x - square_rect.left) * (9 / square_size),
				)
				const valid_col = clamp(moving_col, 0, 8)
				moving_cols = get_connected_cols(pieces, col_connections, valid_col)

				const is_blocked_col = pieces.some(
					(piece) => moving_cols.includes(piece.x) && piece.fixed,
				)
				if (is_blocked_col) {
					reset_movement()
					send_toast({
						title: 'Column is blocked',
						variant: 'error',
					})
					return
				}

				const copies_in_cols = create_copies_vertical(pieces, moving_cols)
				pieces = pieces.concat(copies_in_cols)
				moving_pieces = pieces.filter((piece) => moving_cols.includes(piece.x))
				break
		}
	}

	function handle_keydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && app_state === 'moving') {
			reset_movement()
		}
	}

	function connect_row(row: number) {
		if (active_row === null) {
			active_row = row
			active_col = null
			return
		}

		if (active_row === row) {
			active_row = null
			return
		}

		const connection_old_1 = row_connections.find((c) => c.includes(active_row!))
		const connection_old_2 = row_connections.find((c) => c.includes(row))

		if (!connection_old_1 && !connection_old_2) {
			const connection_new = [active_row, row]
			row_connections.push(connection_new)
		} else if (connection_old_1 && !connection_old_2) {
			connection_old_1.push(row)
		} else if (connection_old_2 && !connection_old_1) {
			connection_old_2.push(active_row)
		} else if (connection_old_1 && connection_old_2) {
			row_connections = row_connections.filter((c) => c != connection_old_2)
			connection_old_1.push(...connection_old_2)
		}

		active_row = null
	}

	function remove_row_connection(row: number) {
		row_connections = row_connections.filter((r) => !r.includes(row))
	}

	function connect_col(col: number) {
		if (active_col === null) {
			active_col = col
			active_row = null
			return
		}

		if (active_col === col) {
			active_col = null
			return
		}

		const connection_old_1 = col_connections.find((c) => c.includes(active_col!))
		const connection_old_2 = col_connections.find((c) => c.includes(col))

		if (!connection_old_1 && !connection_old_2) {
			const connection_new = [active_col, col]
			col_connections.push(connection_new)
		} else if (connection_old_1 && !connection_old_2) {
			connection_old_1.push(col)
		} else if (connection_old_2 && !connection_old_1) {
			connection_old_2.push(active_col)
		} else if (connection_old_1 && connection_old_2) {
			col_connections = col_connections.filter((c) => c != connection_old_2)
			connection_old_1.push(...connection_old_2)
		}

		active_col = null
	}

	function remove_col_connection(col: number) {
		col_connections = col_connections.filter((c) => !c.includes(col))
	}
</script>

<svelte:window onkeydown={handle_keydown} />

<div class="game" style:--size="{square_size}px">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="square {app_state}"
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
		{#each pieces as piece (piece.id)}
			<PieceComponent {piece} {app_state} />
		{/each}
	</div>

	{#if app_state === 'editing'}
		{#each pieces as piece (piece.id)}
			<PieceEditor
				{piece}
				toggle_bandage_down={() => toggle_bandage(piece, pieces, 'down')}
				toggle_bandage_right={() => toggle_bandage(piece, pieces, 'right')}
				toggle_fixed={() => toggle_fixed(piece)}
			></PieceEditor>
		{/each}
	{/if}

	{#each { length: 9 } as _, row}
		<Connector
			type="row"
			index={row}
			disabled={app_state !== 'editing'}
			active={row === active_row}
			connect={() => connect_row(row)}
			remove={() => remove_row_connection(row)}
			group={row_connections.findIndex((c) => c.includes(row))}
		/>
	{/each}

	{#each { length: 9 } as _, col}
		<Connector
			type="col"
			index={col}
			disabled={app_state !== 'editing'}
			active={col === active_col}
			connect={() => connect_col(col)}
			remove={() => remove_col_connection(col)}
			group={col_connections.findIndex((c) => c.includes(col))}
		/>
	{/each}
</div>

<style>
	.game {
		position: relative;
		--dim: calc(var(--size) / 9);

		@media (max-width: 720px) {
			padding-right: calc(0.25 * var(--dim));
			margin-left: calc(-0.1 * var(--dim));
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
