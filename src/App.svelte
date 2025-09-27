<script lang="ts">
	import Game from './lib/Game.svelte'
	import Header from './lib/Header.svelte'
	import Infos from './lib/Infos.svelte'
	import Menu from './lib/Menu.svelte'
	import { get_pieces, type Piece } from './lib/pieces'
	import Torus from './lib/Torus.svelte'
	import Toast from './lib/Toast.svelte'

	let pieces = $state<Piece[]>(get_pieces())

	let show_torus = $state(false)

	function reset() {
		for (const piece of pieces) {
			piece.x = piece.original_x
			piece.y = piece.original_y
			piece.dx = 0
			piece.dy = 0
		}
	}

	function scramble() {
		const free_coordinates: [number, number][] = []

		for (let x = 0; x < 9; x++) {
			for (let y = 0; y < 9; y++) {
				free_coordinates.push([x, y])
			}
		}

		for (const piece of pieces) {
			if (!free_coordinates.length) return
			const i = Math.floor(Math.random() * free_coordinates.length)
			const [x, y] = free_coordinates[i]
			piece.x = x
			piece.y = y
			free_coordinates.splice(i, 1)
		}
	}

	function toggle_torus() {
		show_torus = !show_torus
	}
</script>

<Header />

<div class="grid" class:show_torus>
	<Game bind:pieces />

	{#if show_torus}
		<Torus {pieces} />
	{/if}

	<Menu {scramble} {reset} {toggle_torus} {show_torus} />

	<Infos />
</div>

<Toast position="bottom-center" />

<style>
	.grid {
		--maxwidth: 600px;
		max-width: var(--maxwidth);
		margin-inline: auto;
	}

	@media (min-width: 1200px) {
		.grid.show_torus {
			display: grid;
			grid-template-columns: 1fr 1fr;
			align-items: center;
			max-width: 1300px;
			margin-inline: auto;
		}
	}
</style>
