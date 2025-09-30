<script lang="ts">
	import { clamp, get_changed_position, get_position, throttle } from '../utils'
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
	}

	let {
		pieces = $bindable(),
		update_pieces_array,
		app_state = $bindable(),
		move_count = $bindable(),
	}: Props = $props()

	let square_element = $state<HTMLDivElement | null>(null)
	let square_size = $state(0)
	let clicked_pos: { x: number; y: number } | null = null
	let move_direction: 'horizontal' | 'vertical' | null = null
	let moving_pieces: Piece[] = []
	let moving_rows: number[] = []
	let moving_cols: number[] = []

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

		switch (move_direction) {
			case 'horizontal':
				for (const piece of moving_pieces) {
					const dx = current_pos.x - clicked_pos.x
					const dx_int = Math.round(dx * (9 / square_size))
					const valid_dx = clamp(dx_int, -10, 10)
					piece.x += valid_dx
					piece.dx = 0
					piece.dy = 0
				}
				break
			case 'vertical':
				for (const piece of moving_pieces) {
					const dy = current_pos.y - clicked_pos.y
					const dy_int = Math.round(dy * (9 / square_size))
					const valid_dy = clamp(dy_int, -10, 10)
					piece.y += valid_dy
					piece.dx = 0
					piece.dy = 0
				}
				break
		}

		pieces = get_visible_pieces(pieces)
		reset_movement()
		update_pieces_array()
		handle_solved_state()
		move_count++
	}

	function reset_movement() {
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
				moving_rows = get_connected_rows(pieces, valid_row)

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
				moving_cols = get_connected_cols(pieces, valid_col)

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
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="square {app_state}"
	bind:this={square_element}
	bind:clientWidth={square_size}
	style:--size="{square_size}px"
	onmousedown={handle_mouse_down}
	onmousemove={throttle(handle_mouse_move, 1000 / 60)}
	onmouseup={handle_mouse_up}
	onmouseleave={handle_mouse_up}
	ontouchstart={handle_mouse_down}
	ontouchmove={throttle(handle_mouse_move, 1000 / 60)}
	ontouchend={handle_mouse_up}
>
	{#each pieces as piece (piece.id)}
		<div
			class="piece"
			data-type={piece.type}
			data-original-x={piece.original_x}
			data-original-y={piece.original_y}
			class:bandaged_right={piece.bandaged_right}
			class:bandaged_down={piece.bandaged_down}
			class:bandaged_left={piece.bandaged_left}
			class:bandaged_up={piece.bandaged_up}
			style:--x={piece.x}
			style:--y={piece.y}
			style:--dx={piece.dx}
			style:--dy={piece.dy}
		>
			{#if piece.fixed && app_state !== 'bandaging'}
				<div class="dot"></div>
			{/if}
		</div>
	{/each}

	{#if app_state === 'bandaging'}
		{#each pieces as piece (piece.id)}
			<button
				class="bandager"
				data-direction="right"
				aria-label="bandage rightwards"
				onclick={() => toggle_bandage(piece, pieces, 'right')}
				role="switch"
				aria-checked={piece.bandaged_right}
				style:--x={piece.x}
				style:--y={piece.y}
			>
			</button>

			<button
				class="bandager"
				data-direction="down"
				aria-label="bandage downwards"
				onclick={() => toggle_bandage(piece, pieces, 'down')}
				role="switch"
				aria-checked={piece.bandaged_down}
				style:--x={piece.x}
				style:--y={piece.y}
			>
			</button>

			<button
				class="fixer"
				onclick={() => toggle_fixed(piece)}
				aria-label="fix piece"
				role="switch"
				aria-checked={piece.fixed}
				style:--x={piece.x}
				style:--y={piece.y}
			>
			</button>
		{/each}
	{/if}
</div>

<style>
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

		@media (min-width: 600px) {
			--border: 0.1rem;
		}

		&.bandaging {
			cursor: default;
			overflow: visible;
			clip-path: none;
		}

		&.scrambling .piece {
			transition: none;
		}
	}

	.piece {
		position: absolute;
		--dim: calc(var(--size) / 9);
		width: var(--dim);
		height: var(--dim);
		background-color: var(--color, gray);
		transform: translateX(calc(var(--x) * var(--dim) + var(--dx) * 1px))
			translateY(calc(var(--y) * var(--dim) + var(--dy) * 1px));
		transition: transform 80ms ease-out;
		border: var(--border) solid var(--bg-color);
		border-radius: 15%;
		display: flex;
		justify-content: center;
		align-items: center;

		&.bandaged_right {
			border-right: none;
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
			width: calc(var(--dim) + 1px);
		}

		&.bandaged_down {
			border-bottom: none;
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
			height: calc(var(--dim) + 1px);
		}

		&.bandaged_left {
			border-left: none;
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
		}

		&.bandaged_up {
			border-top: none;
			border-top-left-radius: 0;
			border-top-right-radius: 0;
		}

		.dot {
			background-color: var(--bg-color);
			width: 25%;
			aspect-ratio: 1;
			border-radius: 50%;
		}
	}

	.bandager,
	.fixer {
		--dim: calc(var(--size) / 9);
		position: absolute;
		background-color: var(--bg-color);
		transform: translate(-50%, -50%);

		opacity: 0.15;
		transition: opacity 120ms;

		&[aria-checked='true'] {
			opacity: 1;
		}

		&:hover,
		&:focus-visible {
			opacity: 1;
			outline: 1px solid var(--font-color);
		}

		&::before {
			content: '';
			position: absolute;
			inset: -2px;
		}
	}

	.bandager {
		border-radius: 10%;
	}

	.fixer {
		width: 2%;
		height: 2%;
		border-radius: 50%;
		left: calc(var(--x) * var(--dim) + var(--dim) / 2);
		top: calc(var(--y) * var(--dim) + var(--dim) / 2);
	}

	.bandager[data-direction='right'] {
		width: 3.75%;
		height: 1.75%;
		left: calc(var(--x) * var(--dim) + var(--dim));
		top: calc(var(--y) * var(--dim) + var(--dim) / 2);
	}

	.bandager[data-direction='down'] {
		width: 1.75%;
		height: 3.75%;
		left: calc(var(--x) * var(--dim) + var(--dim) / 2);
		top: calc(var(--y) * var(--dim) + var(--dim));
	}
</style>
