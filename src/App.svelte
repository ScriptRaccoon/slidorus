<script lang="ts">
	import Game from './lib/Game.svelte'
	import Header from './lib/Header.svelte'
	import Infos from './lib/Infos.svelte'
	import Menu from './lib/Menu.svelte'
	import {
		create_piece_array,
		get_initial_pieces,
		encode_pieces,
		reset_pieces,
		scramble_pieces,
		unbandage_pieces,
		type Piece,
		decode_config,
	} from './lib/pieces'
	import Torus from './lib/Torus.svelte'
	import Toast, { send_toast } from './lib/Toast.svelte'
	import type { APP_STATE } from './lib/types'
	import { onMount } from 'svelte'

	const initial_pieces = get_initial_pieces()

	let pieces = $state<Piece[]>(initial_pieces)
	let pieces_array = $state<Piece[][]>(create_piece_array(initial_pieces))

	let app_state = $state<APP_STATE>('idle')
	let show_torus = $state(false)
	let move_count = $state(0)

	function reset() {
		if (app_state !== 'idle') return
		reset_pieces(pieces)
		update_pieces_array()
		move_count = 0
	}

	async function scramble() {
		if (app_state !== 'idle') return
		app_state = 'scrambling'
		await scramble_pieces(pieces, 10)
		update_pieces_array()
		app_state = 'idle'
		move_count = 0
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
			reset()
			app_state = 'bandaging'
		}
	}

	function reset_bandaging() {
		if (app_state === 'bandaging') unbandage_pieces(pieces)
	}

	async function share() {
		const config = encode_pieces(pieces)

		const url = new URL(window.location.origin)
		if (config.length) url.searchParams.set('config', config)

		await navigator.clipboard.writeText(url.href)

		send_toast({
			variant: 'info',
			title: 'URL copied to clipboard',
		})
	}

	function load_config_from_URL() {
		const url = new URL(window.location.href)
		const config = url.searchParams.get('config')
		if (!config) return

		try {
			const decoded_pieces = decode_config(config)
			pieces = decoded_pieces
			update_pieces_array()
		} catch (err) {
			console.error(err)
			send_toast({
				variant: 'error',
				title: 'Invalid config in URL',
			})
		}
	}

	onMount(load_config_from_URL)
</script>

<Header />

<div class="grid" class:show_torus>
	<div class="game_container">
		<div class="move_count">{move_count} moves</div>
		<Game bind:pieces {update_pieces_array} bind:app_state bind:move_count />
	</div>

	<Menu
		{scramble}
		{reset}
		{toggle_torus}
		{show_torus}
		{toggle_bandaging}
		{reset_bandaging}
		{share}
		{app_state}
	/>

	{#if app_state === 'bandaging'}
		<div class="instructions">
			<strong>Instructions.</strong>
			Click between two pieces to bandage them. You can bandage as many pieces as you
			like. When one piece moves, all pieces connected to it also move. Click on the
			middle of a piece to make it fixed. It won't be able to move anymore.
		</div>
	{/if}

	{#if show_torus}
		<Torus {pieces_array} />
	{/if}

	<Infos />
</div>

<Toast position="bottom-center" />

<style>
	.grid {
		max-width: 600px;
		margin-inline: auto;
		display: grid;
		grid-auto-flow: dense;
		row-gap: 1rem;

		> :global(:not(.scene)) {
			grid-column: 1;
		}

		@media (min-width: 600px) {
			row-gap: 1.5rem;
		}

		@media (min-width: 1200px) {
			&.show_torus {
				max-width: 1220px;
				column-gap: 20px;
				grid-template-columns: 1fr 1fr;

				> :global(:not(.scene)) {
					grid-column: 1;
				}
			}
		}
	}

	.game_container {
		position: relative;
	}

	.move_count {
		position: absolute;
		bottom: 100%;
		color: var(--secondary-font-color);
		font-size: 0.875rem;
	}

	.instructions {
		color: var(--secondary-font-color);
		line-height: 1.4;
	}
</style>
