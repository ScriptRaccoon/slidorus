<script lang="ts">
	import type { Piece as PieceType } from '../core/piece.svelte'

	type Props = {
		piece: PieceType
		toggle_bandage_right: () => void
		toggle_bandage_down: () => void
		disabled: boolean
	}

	let { piece, toggle_bandage_down, toggle_bandage_right, disabled }: Props =
		$props()
</script>

<button
	{disabled}
	class="bandager"
	data-direction="right"
	aria-label="bandage rightwards"
	onclick={toggle_bandage_right}
	aria-pressed={piece.bandaged_right}
	style:--x={piece.x}
	style:--y={piece.y}
>
</button>

<button
	{disabled}
	class="bandager"
	data-direction="down"
	aria-label="bandage downwards"
	onclick={toggle_bandage_down}
	aria-pressed={piece.bandaged_down}
	style:--x={piece.x}
	style:--y={piece.y}
>
</button>

<button
	{disabled}
	class="fixer"
	onclick={() => piece.toggle_fixed()}
	aria-label="fix piece"
	aria-pressed={piece.fixed}
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

		opacity: 0;

		&:not(:disabled) {
			opacity: 0.15;

			&[aria-pressed='true'] {
				opacity: 1;
			}
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

		&[data-direction='right'] {
			width: 3.75%;
			height: 1.75%;
			left: calc(var(--x) * var(--u) + var(--u));
			top: calc(var(--y) * var(--u) + var(--u) / 2);
		}

		&[data-direction='down'] {
			width: 1.75%;
			height: 3.75%;
			left: calc(var(--x) * var(--u) + var(--u) / 2);
			top: calc(var(--y) * var(--u) + var(--u));
		}
	}

	.fixer {
		width: calc(0.2 * var(--u));
		aspect-ratio: 1;
		border-radius: 50%;
		left: calc(var(--x) * var(--u) + var(--u) / 2);
		top: calc(var(--y) * var(--u) + var(--u) / 2);
	}
</style>
