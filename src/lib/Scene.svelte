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
					></div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.scene {
		background-color: var(--bg-color);
		border-radius: 0.5rem;
		aspect-ratio: 4.25 / 3;
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
		--elevation: calc(-0.5 * var(--unit));
		--tilt: -35deg;
		--slice-radius: calc(1.2 * var(--unit));
		--outer-radius: calc(2.4 * var(--unit));
		--tile-amount: 9;
		transform: translateY(var(--elevation)) rotateX(var(--tilt));
		animation: rotatearound 60s linear infinite;
	}

	@keyframes rotatearound {
		from {
			rotate: translateY(var(--elevation)) rotateX(var(--tilt)) rotateY(0deg);
		}
		to {
			transform: translateY(var(--elevation)) rotateX(var(--tilt)) rotateY(1turn);
		}
	}

	.tile {
		height: var(--unit);
		aspect-ratio: 2.4/3;
		border-radius: 0.25rem;
		background-color: var(--color, white);
		transition: background-color 140ms ease-in-out;
		transform: rotateX(90deg)
			rotateY(calc(var(--index, 0) * 360deg / var(--tile-amount)))
			translateZ(var(--slice-radius));
		opacity: 0.95;
		box-shadow: 0rem 0rem 1rem inset #0006;
	}

	.slice {
		transform: rotateY(calc(var(--num, 0) * 360deg / var(--tile-amount)))
			translateX(var(--outer-radius));
	}
</style>
