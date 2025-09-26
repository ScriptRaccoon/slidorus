<script lang="ts">
	import { onMount } from 'svelte'
	import { throttle } from '../utils'
	import { get_copy, type Piece } from './pieces'

	type Props = {
		pieces: Piece[]
	}

	let { pieces = $bindable() }: Props = $props()

	const MAX_WIDTH = 600

	let square_size = $state(0)

	let initial_pos = $state<[number, number] | null>(null)
	let move_direction = $state<'horizontal' | 'vertical' | null>(null)
	let dragged_row = $state<number | null>(null)
	let dragged_col = $state<number | null>(null)
	let moving_pieces = $state<Piece[]>([])
	let square_element = $state<HTMLDivElement | null>(null)

	function setup_square() {
		const padding = 10
		square_size = Math.min(window.innerWidth, MAX_WIDTH) - 2 * padding
	}

	onMount(() => {
		setup_square()
	})

	function handle_mouse_down(e: MouseEvent | TouchEvent) {
		/**
		 * TODO: refactor me
		 */

		if (!square_element) return
		const square_rect = square_element.getBoundingClientRect()
		const touch = 'touches' in e ? e.touches[0] : e
		initial_pos = [touch.clientX, touch.clientY]
		move_direction = null
		dragged_row = Math.floor((touch.clientY - square_rect.top) * (9 / square_size))
		dragged_col = Math.floor((touch.clientX - square_rect.left) * (9 / square_size))
		moving_pieces = []

		for (let i = 0; i < 9; i++) {
			const piece_in_row = pieces.find(
				(piece) => piece.x === i && piece.y === dragged_row,
			)
			if (!piece_in_row) return

			copy_piece(piece_in_row, i + 9, dragged_row)
			copy_piece(piece_in_row, i + 2 * 9, dragged_row)
			copy_piece(piece_in_row, i - 9, dragged_row)
			copy_piece(piece_in_row, i - 2 * 9, dragged_row)

			const piece_in_col = pieces.find(
				(piece) => piece.x === dragged_col && piece.y === i,
			)
			if (!piece_in_col) return

			copy_piece(piece_in_col, dragged_col, i + 9)
			copy_piece(piece_in_col, dragged_col, i + 2 * 9)
			copy_piece(piece_in_col, dragged_col, i - 9)
			copy_piece(piece_in_col, dragged_col, i - 2 * 9)
		}
	}

	function handle_mouse_move(e: MouseEvent | TouchEvent) {
		const touch = 'touches' in e ? e.touches[0] : e

		detect_direction(e)

		if (!initial_pos || !move_direction) return

		const current_pos = [touch.clientX, touch.clientY]

		const dx = current_pos[0] - initial_pos[0]
		const dy = current_pos[1] - initial_pos[1]

		for (const piece of moving_pieces) {
			if (move_direction === 'horizontal') {
				piece.dx = dx
			} else {
				piece.dy = dy
			}
		}
	}

	function handle_mouse_up(e: MouseEvent | TouchEvent) {
		const touch = 'changedTouches' in e ? e.changedTouches[0] : e

		if (!initial_pos) return

		const current_pos = [touch.clientX, touch.clientY]

		const dx = current_pos[0] - initial_pos[0]
		const dy = current_pos[1] - initial_pos[1]

		const dx_int = Math.round(dx * (9 / square_size))
		const dy_int = Math.round(dy * (9 / square_size))

		for (const piece of moving_pieces) {
			if (move_direction === 'horizontal') {
				piece.x += dx_int
			} else {
				piece.y += dy_int
			}
			piece.dx = 0
			piece.dy = 0
		}

		pieces = pieces.filter(
			(piece) => piece.x >= 0 && piece.x < 9 && piece.y >= 0 && piece.y < 9,
		)

		initial_pos = null
		move_direction = null
		dragged_row = null
		dragged_col = null
		moving_pieces = []
	}

	function copy_piece(piece: Piece, x: number, y: number) {
		const new_piece = get_copy(piece)
		new_piece.x = x
		new_piece.y = y
		pieces.push(new_piece)
	}

	function detect_direction(e: MouseEvent | TouchEvent) {
		const touch = 'touches' in e ? e.touches[0] : e

		if (!initial_pos) return
		if (move_direction) return

		const current_pos = [touch.clientX, touch.clientY]

		const dx = current_pos[0] - initial_pos[0]
		const dy = current_pos[1] - initial_pos[1]

		const too_early = Math.abs(dx) + Math.abs(dy) < 10

		if (too_early) return

		move_direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'

		moving_pieces =
			move_direction === 'horizontal'
				? pieces.filter((piece) => piece.y === dragged_row)
				: pieces.filter((piece) => piece.x === dragged_col)
	}
</script>

<svelte:window on:resize={setup_square} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="square"
	bind:this={square_element}
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
			style:--x={piece.x}
			style:--y={piece.y}
			style:--dx={piece.dx}
			style:--dy={piece.dy}
		></div>
	{/each}
</div>

<style>
	.square {
		width: var(--size);
		height: var(--size);
		margin-inline: auto;
		--border: 1px;
		cursor: move;
		touch-action: none;
		clip-path: inset(var(--border));

		@media (min-width: 600px) {
			--border: 0.1rem;
		}
	}

	.piece {
		position: absolute;
		width: calc(var(--size) / 9);
		height: calc(var(--size) / 9);
		background-color: var(--color, gray);
		transform: translateX(calc(var(--x) * var(--size) / 9 + var(--dx) * 1px))
			translateY(calc(var(--y) * var(--size) / 9 + var(--dy) * 1px));

		transition: transform 80ms ease-out;
		border: var(--border) solid black;
		box-shadow: 0.1rem 0.1rem calc(0.1 * var(--size) / 9) inset #00000025;
		border-radius: 15%;
	}
</style>
