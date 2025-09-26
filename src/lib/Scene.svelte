<script lang="ts">
	import { create_type_array, type Piece } from './pieces'

	type Props = {
		pieces: Piece[]
	}

	let { pieces }: Props = $props()

	let piece_type_array = $derived(create_type_array(pieces))
</script>

<div class="scene">
	<div class="torus">
		{#each { length: 9 } as _, i}
			<div class="slice" style:--num={i}>
				{#each { length: 9 } as _, j}
					<div
						class="tile"
						style:--index={j}
						data-type={piece_type_array[i][j]}
						data-index={j}
					></div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.scene {
		aspect-ratio: 5 / 4;
		perspective: 1200px;
		display: flex;
		align-items: center;
		justify-content: center;

		* {
			position: absolute;
			transform-style: preserve-3d;
		}
	}

	.torus {
		--unit: min(10vw, 4rem);
		--elevation: calc(-0.25 * var(--unit));
		--tilt: -70deg;
		--slice-radius: calc(1.2 * var(--unit));
		--outer-radius: calc(2.65 * var(--unit));
		--tile-amount: 9;
		transform: translateY(var(--elevation)) rotateX(var(--tilt)) rotateY(0deg);
		animation: rotatearound 180s linear infinite;
	}

	@keyframes rotatearound {
		0% {
			rotate: translateY(var(--elevation)) rotateX(var(--tilt)) rotateY(0deg);
		}
		50% {
			transform: translateY(var(--elevation)) rotateX(calc(-1 * var(--tilt)))
				rotateY(1turn);
		}
		100% {
			transform: translateY(var(--elevation)) rotateX(var(--tilt)) rotateY(2turn);
		}
	}

	.tile {
		height: calc(2.4 / 3 * var(--unit));
		width: calc(var(--multiplier, 1) * var(--unit));
		border-radius: 0.25rem;
		background-color: var(--color, white);
		transition: background-color 140ms ease-in-out;
		transform: rotateX(calc(var(--index, 0) * 360deg / var(--tile-amount)))
			translateZ(var(--slice-radius));
		opacity: 0.95;
		box-shadow: 0rem 0rem 1rem inset #0006;

		&[data-index='0'] {
			--multiplier: 2.7;
		}

		&[data-index='1'] {
			--multiplier: 2.7;
			clip-path: polygon(7% 0%, 93% 0%, 100% 100%, 0% 100%);
		}

		&[data-index='8'] {
			--multiplier: 2.7;
			clip-path: polygon(0% 0%, 100% 0%, 93% 100%, 7% 100%);
		}

		&[data-index='2'] {
			--multiplier: 2.25;
			clip-path: polygon(14% 0%, 90% 0%, 100% 100%, 0% 100%);
		}

		&[data-index='7'] {
			clip-path: polygon(0% 0%, 100% 0%, 88% 100%, 12% 100%);
			--multiplier: 2.25;
		}

		&[data-index='3'] {
			--multiplier: 1.65;
			clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
		}

		&[data-index='6'] {
			--multiplier: 1.65;
			clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
		}

		&[data-index='4'] {
			--multiplier: 1.1;
			clip-path: polygon(9% 0%, 91% 0%, 100% 100%, 0% 100%);
		}

		&[data-index='5'] {
			--multiplier: 1.1;
			clip-path: polygon(0% 0%, 100% 0%, 91% 100%, 9% 100%);
		}
	}

	.slice {
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotateY(calc(var(--num, 0) * 360deg / var(--tile-amount)))
			translateZ(var(--outer-radius));
	}
</style>
