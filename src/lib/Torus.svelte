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
						class:flipped={j >= 5}
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
		margin: 1rem 10px;
		aspect-ratio: 5 / 4;
		perspective: 1200px;
		background-image: radial-gradient(#383820 0%, #111 70%, #111 100%);
		border-radius: 0.5rem;
		overflow: hidden;

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
		--tilt: -60deg;
		--slice-radius: calc(1.2 * var(--unit));
		--outer-radius: calc(2.65 * var(--unit));
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
		height: calc(2.64 / 3 * var(--unit));
		width: calc(var(--scaler, 1) * var(--unit));
		transform: rotateX(calc(var(--index, 0) * 360deg / 9))
			translateZ(var(--slice-radius));

		background-color: black;
		display: inline-flex;
		justify-content: center;
		align-items: center;

		opacity: 0.94;

		&:not(.flipped) {
			clip-path: polygon(
				var(--cut, 0%) 0%,
				calc(100% - var(--cut, 0%)) 0%,
				100% 100%,
				0% 100%
			);
		}

		&.flipped {
			clip-path: polygon(
				0% 0%,
				100% 0%,
				calc(100% - var(--cut, 0%)) 100%,
				var(--cut, 0%) 100%
			);
		}

		&::before {
			content: '';
			width: 90%;
			height: 90%;
			transition: background-color 140ms ease-in-out;
			background-color: var(--color, gray);
			clip-path: inherit;
			box-shadow: 0rem 0rem 1rem inset #0005;
		}

		&[data-index='0'] {
			--scaler: 2.81;
			--cut: 0%;
		}

		&[data-index='1'],
		&[data-index='8'] {
			--scaler: 2.81;
			--cut: 6.5%;
		}

		&[data-index='2'],
		&[data-index='7'] {
			--scaler: 2.4;
			--cut: 13%;
		}

		&[data-index='3'],
		&[data-index='6'] {
			--scaler: 1.77;
			--cut: 15.5%;
		}

		&[data-index='4'],
		&[data-index='5'] {
			--scaler: 1.22;
			--cut: 9%;
		}
	}

	.slice {
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotateY(calc(var(--num, 0) * 360deg / 9))
			translateZ(var(--outer-radius));
	}
</style>
