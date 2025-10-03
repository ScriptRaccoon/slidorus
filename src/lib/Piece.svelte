<script lang="ts">
	import type { Piece as PieceType } from './pieces'
	import { app } from './state.svelte'

	type Props = {
		piece: PieceType
	}

	let { piece }: Props = $props()
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
	style:--x={piece.x}
	style:--y={piece.y}
	style:--dx={piece.dx}
	style:--dy={piece.dy}
	class:no_transition={app.state === 'scrambling'}
>
	{#if piece.fixed && app.state !== 'editing'}
		<div class="dot"></div>
	{/if}
</div>

<style>
	.piece {
		position: absolute;
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

		&.no_transition {
			transition: none;
		}

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
</style>
