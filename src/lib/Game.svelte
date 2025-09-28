<script lang="ts">
	import { clamp, get_changed_position, get_position, throttle } from '../utils'
	import {
		check_solved,
		get_connected_cols,
		get_connected_rows,
		get_copy,
		toggle_bandage,
		type Piece,
	} from './pieces'
	import { send_toast } from './Toast.svelte'

	type Props = {
		pieces: Piece[]
		is_moving: boolean
		update_pieces_array: () => void
		is_bandaging: boolean
		is_scrambling: boolean
	}

	let animate_square = $state(false)

	let {
		pieces = $bindable(),
		is_moving = $bindable(),
		update_pieces_array,
		is_bandaging,
		is_scrambling,
	}: Props = $props()

	let square_element = $state<HTMLDivElement | null>(null)

	let clicked_pos: { x: number; y: number } | null = null
	let move_direction: 'horizontal' | 'vertical' | null = null
	let moving_pieces: Piece[] = []
	let moving_rows: number[] = []
	let moving_cols: number[] = []

	function handle_mouse_down(e: MouseEvent | TouchEvent) {
		if (is_moving || is_bandaging || is_scrambling || !square_element) return

		clicked_pos = get_position(e)

		move_direction = null
		moving_pieces = []

		const square_rect = square_element.getBoundingClientRect()
		const moving_row = Math.floor(
			(clicked_pos.y - square_rect.top) * (9 / square_element.clientHeight),
		)

		const moving_col = Math.floor(
			(clicked_pos.x - square_rect.left) * (9 / square_element.clientWidth),
		)

		const is_valid =
			moving_row >= 0 && moving_row < 9 && moving_col >= 0 && moving_col < 9
		if (!is_valid) return

		moving_rows = get_connected_rows(pieces, moving_row)
		moving_cols = get_connected_cols(pieces, moving_col)

		is_moving = true

		const copies = create_copies(moving_rows, moving_cols)
		pieces = pieces.concat(copies)
	}

	function create_copies(moving_rows: number[], moving_cols: number[]): Piece[] {
		const copies: Piece[] = []
		const offsets = [1, 2, -1, -2]

		for (let i = 0; i < 9; i++) {
			for (const moving_row of moving_rows) {
				const piece_in_row = pieces.find(
					(piece) => piece.x === i && piece.y === moving_row,
				)
				if (piece_in_row) {
					for (const offset of offsets) {
						const copy = get_copy(piece_in_row)
						copy.x += offset * 9
						copies.push(copy)
					}
				}
			}

			for (const moving_col of moving_cols) {
				const piece_in_col = pieces.find(
					(piece) => piece.x === moving_col && piece.y === i,
				)

				if (piece_in_col) {
					for (const offset of offsets) {
						const copy = get_copy(piece_in_col)
						copy.y += offset * 9
						copies.push(copy)
					}
				}
			}
		}

		return copies
	}

	function handle_mouse_move(e: MouseEvent | TouchEvent) {
		if (is_bandaging || is_scrambling || !clicked_pos || !is_moving) return

		const current_pos = get_position(e)
		const dx = current_pos.x - clicked_pos.x
		const dy = current_pos.y - clicked_pos.y

		if (!move_direction) detect_direction(dx, dy)
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
		if (
			is_bandaging ||
			is_scrambling ||
			!clicked_pos ||
			!square_element ||
			!move_direction
		)
			return

		const current_pos = get_changed_position(e)

		for (const piece of moving_pieces) {
			if (move_direction === 'horizontal') {
				const dx = current_pos.x - clicked_pos.x
				const dx_int = Math.round(dx * (9 / square_element.clientWidth))
				const valid_dx = clamp(dx_int, -10, 10)
				piece.x += valid_dx
			} else {
				const dy = current_pos.y - clicked_pos.y
				const dy_int = Math.round(dy * (9 / square_element.clientHeight))
				const valid_dy = clamp(dy_int, -10, 10)
				piece.y += valid_dy
			}

			piece.dx = 0
			piece.dy = 0
		}

		pieces = pieces.filter(
			(piece) => piece.x >= 0 && piece.x < 9 && piece.y >= 0 && piece.y < 9,
		)

		clicked_pos = null
		move_direction = null
		moving_pieces = []
		is_moving = false
		moving_rows = []
		moving_cols = []

		update_pieces_array()
		handle_solved_state()
	}

	function handle_solved_state() {
		const is_solved = check_solved(pieces)
		if (is_solved) {
			send_toast({
				title: 'Puzzle solved!',
				variant: 'success',
			})

			animate_square = true
			setTimeout(() => {
				animate_square = false
			}, 500)
		}
	}

	function detect_direction(dx: number, dy: number) {
		const too_early = Math.abs(dx) + Math.abs(dy) < 3
		if (too_early) return

		move_direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'

		moving_pieces =
			move_direction === 'horizontal'
				? pieces.filter((piece) => moving_rows.includes(piece.y))
				: pieces.filter((piece) => moving_cols.includes(piece.x))
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="square"
	class:animate_square
	bind:this={square_element}
	onmousedown={handle_mouse_down}
	onmousemove={throttle(handle_mouse_move, 1000 / 60)}
	onmouseup={handle_mouse_up}
	onmouseleave={handle_mouse_up}
	ontouchstart={handle_mouse_down}
	ontouchmove={throttle(handle_mouse_move, 1000 / 60)}
	ontouchend={handle_mouse_up}
	class:is_bandaging
	class:is_scrambling
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
		></div>
	{/each}

	{#if is_bandaging}
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
		{/each}
	{/if}
</div>

<style>
	.square {
		position: relative;
		--size: calc(min(100vw, var(--maxwidth)) - 20px);
		width: var(--size);
		aspect-ratio: 1;
		margin-inline: auto;
		--border: 1px;
		cursor: move;
		touch-action: none;
		clip-path: inset(var(--border));
		overflow: hidden;

		transition: scale 200ms ease-in-out;

		&.animate_square {
			scale: 1.03;
		}

		@media (min-width: 600px) {
			--border: 0.1rem;
		}

		&.is_bandaging {
			cursor: default;
			overflow: visible;
			clip-path: none;
		}

		&.is_scrambling .piece {
			transition: none;
		}
	}

	.piece {
		position: absolute;
		--dim: calc(var(--size) / 9);
		width: var(--dim);
		aspect-ratio: 1;
		background-color: var(--color, gray);
		transform: translateX(calc(var(--x) * var(--dim) + var(--dx) * 1px))
			translateY(calc(var(--y) * var(--dim) + var(--dy) * 1px));
		/* TODO: disable transition during scramble */
		transition: transform 80ms ease-out;
		border: var(--border) solid var(--bg-color);
		border-radius: 15%;

		&.bandaged_right {
			border-right: none;
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}

		&.bandaged_down {
			border-bottom: none;
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
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
	}

	.bandager {
		--dim: calc(var(--size) / 9);
		position: absolute;
		background-color: var(--bg-color);
		transform: translate(-50%, -50%);
		border-radius: 10%;
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
