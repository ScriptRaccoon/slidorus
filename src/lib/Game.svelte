<script lang="ts">
	import { clamp, get_changed_position, get_position, throttle } from '../utils'
	import { check_solved, get_copy, type Piece } from './pieces'
	import { send_toast } from './Toast.svelte'

	type Props = {
		pieces: Piece[]
	}

	let animate_square = $state(false)

	let { pieces = $bindable() }: Props = $props()

	let square_element = $state<HTMLDivElement | null>(null)

	let clicked_pos: { x: number; y: number } | null = null
	let move_direction: 'horizontal' | 'vertical' | null = null
	let moving_row: number | null = null
	let moving_col: number | null = null
	let moving_pieces: Piece[] = []

	function handle_mouse_down(e: MouseEvent | TouchEvent) {
		if (!square_element) return

		clicked_pos = get_position(e)
		move_direction = null
		moving_pieces = []

		const square_rect = square_element.getBoundingClientRect()
		moving_row = Math.floor(
			(clicked_pos.y - square_rect.top) * (9 / square_element.clientHeight),
		)
		moving_col = Math.floor(
			(clicked_pos.x - square_rect.left) * (9 / square_element.clientWidth),
		)

		const is_valid =
			moving_row >= 0 && moving_row < 9 && moving_col >= 0 && moving_col < 9
		if (!is_valid) return

		const copies: Piece[] = []
		const offsets = [1, 2, -1, -2]

		for (let i = 0; i < 9; i++) {
			const piece_in_row = pieces.find(
				(piece) => piece.x === i && piece.y === moving_row,
			)
			if (piece_in_row) {
				for (const offset of offsets) {
					const copy = copy_piece(piece_in_row, i + offset * 9, moving_row)
					copies.push(copy)
				}
			}

			const piece_in_col = pieces.find(
				(piece) => piece.x === moving_col && piece.y === i,
			)

			if (piece_in_col) {
				for (const offset of offsets) {
					const copy = copy_piece(piece_in_col, moving_col, i + offset * 9)
					copies.push(copy)
				}
			}
		}

		pieces = pieces.concat(copies)
	}

	function handle_mouse_move(e: MouseEvent | TouchEvent) {
		if (!clicked_pos) return

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
		if (!clicked_pos || !square_element || !move_direction) return

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
		moving_row = null
		moving_col = null
		moving_pieces = []

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

	function copy_piece(piece: Piece, x: number, y: number) {
		const copy = get_copy(piece)
		copy.x = x
		copy.y = y
		return copy
	}

	function detect_direction(dx: number, dy: number) {
		const too_early = Math.abs(dx) + Math.abs(dy) < 10
		if (too_early) return

		move_direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'

		moving_pieces =
			move_direction === 'horizontal'
				? pieces.filter((piece) => piece.y === moving_row)
				: pieces.filter((piece) => piece.x === moving_col)
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
	}

	.piece {
		position: absolute;
		--dim: calc(var(--size) / 9);
		width: var(--dim);
		aspect-ratio: 1;
		background-color: var(--color, gray);
		transform: translateX(calc(var(--x) * var(--dim) + var(--dx) * 1px))
			translateY(calc(var(--y) * var(--dim) + var(--dy) * 1px));
		transition: transform 80ms ease-out;
		border: var(--border) solid var(--bg-color);
		border-radius: 15%;
	}
</style>
