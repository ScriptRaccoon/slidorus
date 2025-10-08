<script lang="ts">
	import { TRANSITION_DURATION } from '../core/config'
	import type { Piece as PieceType } from '../core/piece.svelte'

	type Props = {
		piece: PieceType
		animated: boolean
	}

	let { piece, animated }: Props = $props()
</script>

<div
	class="piece"
	data-type={piece.type}
	data-original-x={piece.original_x}
	data-original-y={piece.original_y}
	class:bandaged_right={piece.bandaged_right}
	class:bandaged_down={piece.bandaged_down}
	class:bandaged_left={piece.bandaged_left}
	class:bandaged_up={piece.bandaged_up}
	class:animated
	style:--x={piece.x}
	style:--y={piece.y}
	style:--dx={piece.dx}
	style:--dy={piece.dy}
	style:--transition-duration={animated ? `${TRANSITION_DURATION}ms` : '0ms'}
></div>

<style>
	.piece {
		position: absolute;
		width: var(--u);
		height: var(--u);
		background-color: var(--color, gray);
		transform: translateX(calc(var(--x) * var(--u) + var(--dx) * 1px))
			translateY(calc(var(--y) * var(--u) + var(--dy) * 1px));
		transition: transform var(--transition-duration, 0) ease-out;

		border: var(--border) solid var(--bg-color);
		border-radius: 15%;
		display: flex;
		justify-content: center;
		align-items: center;

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
