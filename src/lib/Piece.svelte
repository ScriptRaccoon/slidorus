<script lang="ts">
	import type { Piece as PieceType } from '../core/piece.svelte'

	type Props = {
		piece: PieceType
		animated: boolean
		dx: number
		dy: number
	}

	let { piece, animated, dx, dy }: Props = $props()
</script>

<div
	class="piece"
	data-color-id={piece.color_id}
	data-original-x={piece.original_x}
	data-original-y={piece.original_y}
	class:bandaged_right={piece.bandaged_right}
	class:bandaged_down={piece.bandaged_down}
	class:bandaged_left={piece.bandaged_left}
	class:bandaged_up={piece.bandaged_up}
	class:fixed={piece.fixed}
	class:rotating={piece.rotating}
	class:animated
	style:--x={piece.x}
	style:--y={piece.y}
	style:--dx={dx}
	style:--dy={dy}
	style:--rotation={piece.rotation}
></div>

<style>
	.piece {
		--speed: 80ms;
		position: absolute;
		width: var(--u);
		height: var(--u);
		background-color: var(--color, gray);
		transform: translateX(calc(var(--x) * var(--u) + var(--dx) * 1px))
			translateY(calc(var(--y) * var(--u) + var(--dy) * 1px))
			scale(var(--scale, 1)) rotate(calc(var(--rotation) * 1deg));
		border: var(--border) solid var(--bg-color);
		border-radius: 15%;
		display: flex;
		justify-content: center;
		align-items: center;

		&.animated {
			transition: transform var(--speed) ease-out;
		}

		&.fixed::before {
			content: '';
			width: 20%;
			aspect-ratio: 1;
			border-radius: 50%;
			background-color: var(--bg-color);
		}

		&.rotating {
			--scale: 0.75;
		}

		&.bandaged_right {
			border-right: none;
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
			width: calc(var(--u) + 1px);
		}

		&.bandaged_down {
			border-bottom: none;
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
			height: calc(var(--u) + 1px);
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
</style>
