<script lang="ts">
	import Game from './lib/Game.svelte'
	import Header from './lib/Header.svelte'
	import Infos from './lib/Infos.svelte'
	import Menu from './lib/Menu.svelte'
	import {
		create_piece_array,
		get_initial_pieces,
		reset_pieces,
		scramble_pieces,
		unbandage_pieces,
		type Piece,
	} from './lib/pieces'
	import Torus from './lib/Torus.svelte'
	import Toast from './lib/Toast.svelte'
	import type { APP_STATE } from './lib/types'

	const initial_pieces = get_initial_pieces()

	let pieces = $state<Piece[]>(initial_pieces)
	let pieces_array = $state<Piece[][]>(create_piece_array(initial_pieces))

	let app_state = $state<APP_STATE>('idle')
	let show_torus = $state(false)

	function reset() {
		if (app_state !== 'idle') return
		reset_pieces(pieces)
		update_pieces_array()
	}

	async function scramble() {
		if (app_state !== 'idle') return
		app_state = 'scrambling'
		await scramble_pieces(pieces, 10)
		update_pieces_array()
		app_state = 'idle'
	}

	function toggle_torus() {
		show_torus = !show_torus
	}

	function update_pieces_array() {
		pieces_array = create_piece_array(pieces)
	}

	function toggle_bandaging() {
		if (app_state === 'bandaging') {
			app_state = 'idle'
		} else if (app_state === 'idle') {
			app_state = 'bandaging'
		}
	}

	function reset_bandaging() {
		if (app_state === 'bandaging') unbandage_pieces(pieces)
	}
</script>

<Header />

<div class="grid" class:show_torus>
	<Game bind:pieces {update_pieces_array} bind:app_state />

	{#if show_torus}
		<Torus {pieces_array} />
	{/if}

	<Menu
		{scramble}
		{reset}
		{toggle_torus}
		{show_torus}
		{toggle_bandaging}
		{reset_bandaging}
		{app_state}
	/>

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
