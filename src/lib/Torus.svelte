<script lang="ts">
	import { Pause, Play } from '@lucide/svelte'
	import type { Piece } from '../core/piece.svelte'
	import { mod } from '../core/utils'

	type Props = {
		torus_piece_grid: Piece[][]
		torus_rotating: boolean
	}

	let { torus_piece_grid, torus_rotating = $bindable() }: Props = $props()

	function toggle_rotation() {
		torus_rotating = !torus_rotating
	}
</script>

<div class="scene">
	<button
		onclick={toggle_rotation}
		aria-label={torus_rotating ? 'Pause' : 'Play'}
	>
		{#if torus_rotating}
			<Pause />
		{:else}
			<Play />
		{/if}
	</button>

	<div class="torus" class:paused={!torus_rotating}>
		{#each { length: 9 } as _, i}
			<div class="slice" style:--num={mod(i + 7, 9)}>
				{#each { length: 9 } as _, j}
					{@const piece = torus_piece_grid[mod(4 - j, 9)][i]}
					<div
						class="tile"
						class:fixed={piece.fixed}
						class:bandaged_up={piece.bandaged_up}
						class:bandaged_down={piece.bandaged_down}
						class:bandaged_left={piece.bandaged_left}
						class:bandaged_right={piece.bandaged_right}
						class:flipped={j >= 5}
						style:--index={j}
						data-color-id={piece.color_id}
						data-index={j}
					></div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.scene {
		aspect-ratio: 1;
		perspective: 1200px;
		background-image: radial-gradient(
			#383820 0%,
			transparent 70%,
			transparent 100%
		);
		border-radius: 0.5rem;
		overflow: hidden;

		display: flex;
		align-items: center;
		justify-content: center;
		align-self: center;

		* {
			position: absolute;
			transform-style: preserve-3d;
		}
	}

	button {
		top: 0.25rem;
		right: 0.25rem;
		color: var(--secondary-font-color);
		padding: 0.5rem;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		scale: 0.9;
		transition: scale 120ms;

		&:hover,
		&:focus-visible {
			scale: 1;
			outline: 1px solid var(--outline-color);
		}
	}

	.torus {
		--unit: min(10vw, 4rem);
		--tilt: -60deg;
		--slice-radius: calc(1.2 * var(--unit));
		--outer-radius: calc(2.65 * var(--unit));
		transform: rotateX(var(--tilt)) rotateY(0deg);
		animation: rotatearound 180s linear infinite;

		&.paused {
			animation-play-state: paused;
		}
	}

	@keyframes rotatearound {
		0% {
			rotate: rotateX(var(--tilt)) rotateY(0deg);
		}
		50% {
			transform: rotateX(calc(-1 * var(--tilt))) rotateY(-1turn);
		}
		100% {
			transform: rotateX(var(--tilt)) rotateY(-2turn);
		}
	}

	.tile {
		height: calc(2.64 / 3 * var(--unit));
		width: calc(var(--scaler, 1) * var(--unit));
		transform: rotateX(calc(var(--index, 0) * 360deg / 9))
			translateZ(var(--slice-radius));

		background: black;
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
			--cut: 7.3%;
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

		&.fixed::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: calc(0.2 * var(--unit));
			aspect-ratio: 1;
			background-color: black;
			border-radius: 50%;
		}

		&.bandaged_down {
			align-items: end;
		}

		&.bandaged_up {
			align-items: start;
		}

		&.bandaged_down::before,
		&.bandaged_up::before {
			height: 95%;
		}

		&.bandaged_up.bandaged_down::before {
			height: 100%;
		}

		&.bandaged_left {
			justify-content: start;
		}

		&.bandaged_right {
			justify-content: end;
		}

		&.bandaged_left::before,
		&.bandaged_right::before {
			width: 95%;
		}

		&.bandaged_left.bandaged_right::before {
			width: 100%;
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
