<script lang="ts">
	import type { Piece as PieceType } from './pieces'

	type Props = {
		piece: PieceType
		toggle_bandage_right: () => void
		toggle_bandage_down: () => void
		toggle_fixed: () => void
	}

	let { piece, toggle_bandage_down, toggle_bandage_right, toggle_fixed }: Props =
		$props()
</script>

<button
	class="bandager"
	data-direction="right"
	aria-label="bandage rightwards"
	onclick={toggle_bandage_right}
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
	onclick={toggle_bandage_down}
	role="switch"
	aria-checked={piece.bandaged_down}
	style:--x={piece.x}
	style:--y={piece.y}
>
</button>

<button
	class="fixer"
	onclick={toggle_fixed}
	aria-label="fix piece"
	role="switch"
	aria-checked={piece.fixed}
	style:--x={piece.x}
	style:--y={piece.y}
>
</button>

<style>
	.bandager,
	.fixer {
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
		left: calc(var(--x) * var(--u) + var(--u) / 2);
		top: calc(var(--y) * var(--u) + var(--u) / 2);
	}

	.bandager[data-direction='right'] {
		width: 3.75%;
		height: 1.75%;
		left: calc(var(--x) * var(--u) + var(--u));
		top: calc(var(--y) * var(--u) + var(--u) / 2);
	}

	.bandager[data-direction='down'] {
		width: 1.75%;
		height: 3.75%;
		left: calc(var(--x) * var(--u) + var(--u) / 2);
		top: calc(var(--y) * var(--u) + var(--u));
	}
</style>
