<script lang="ts">
	import Game from './lib/Game.svelte'
	import Header from './lib/Header.svelte'
	import Infos from './lib/Infos.svelte'
	import Menu from './lib/Menu.svelte'
	import {
		create_piece_array,
		get_pieces,
		scramble_pieces,
		unbandage_pieces,
		type Piece,
	} from './lib/pieces'
	import Torus from './lib/Torus.svelte'
	import Toast from './lib/Toast.svelte'

	const initial_pieces = get_pieces()

	let pieces = $state<Piece[]>(initial_pieces)
	let pieces_array = $state<Piece[][]>(create_piece_array(initial_pieces))

	let show_torus = $state(false)
	let is_bandaging = $state(false)
	let is_moving = $state(false)
	let is_scrambling = $state(false)

	function reset() {
		if (is_bandaging || is_moving) return
		for (const piece of pieces) {
			piece.x = piece.original_x
			piece.y = piece.original_y
			piece.dx = 0
			piece.dy = 0
		}

		update_pieces_array()
	}

	async function scramble() {
		if (is_scrambling) return
		is_scrambling = true
		await scramble_pieces(pieces, 10)
		update_pieces_array()
		is_scrambling = false
	}

	function toggle_torus() {
		if (is_bandaging) return
		show_torus = !show_torus
	}

	function update_pieces_array() {
		pieces_array = create_piece_array(pieces)
	}

	function toggle_bandaging() {
		if (is_moving) return
		is_bandaging = !is_bandaging
	}

	function reset_bandaging() {
		if (!is_bandaging || is_moving) return
		unbandage_pieces(pieces)
	}
</script>

<Header />

<div class="grid" class:show_torus>
	<Game
		bind:pieces
		bind:is_moving
		{update_pieces_array}
		{is_bandaging}
		{is_scrambling}
	/>

	{#if show_torus}
		<Torus {pieces_array} />
	{/if}

	<Menu
		{scramble}
		{reset}
		{toggle_torus}
		{show_torus}
		{toggle_bandaging}
		{is_bandaging}
		{reset_bandaging}
		{is_moving}
		{is_scrambling}
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
