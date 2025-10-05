<script lang="ts">
	import Game from './lib/Game.svelte'
	import Header from './lib/Header.svelte'
	import Infos from './lib/Infos.svelte'
	import Menu from './lib/Menu.svelte'
	import Torus from './lib/Torus.svelte'
	import Toast, { send_toast } from './lib/Toast.svelte'
	import { onMount } from 'svelte'
	import Instructions from './lib/Instructions.svelte'
	import Challenges from './lib/Challenges.svelte'
	import { update_URL_param } from './utils'
	import { COL_KEYS, ROW_KEYS } from './config'
	import { game } from './game.svelte'
	import { Move } from './move'
	import { Encoder } from './encoder'

	let show_torus = $state(false)
	let torus_rotating = $state(true)

	function toggle_torus() {
		show_torus = !show_torus
	}

	function toggle_editing() {
		if (game.state === 'editing') {
			game.state = 'idle'
			update_URL(
				Encoder.encode_pieces(game.pieces),
				Encoder.encode_sets(game.row_connections),
				Encoder.encode_sets(game.col_connections),
			)
		} else if (game.state === 'idle') {
			const has_shown_warning =
				localStorage.getItem('warning_shown') === true.toString()
			if (!has_shown_warning) {
				send_toast({
					variant: 'info',
					title: 'Editing will reset the puzzle. If you are sure, click again.',
					duration: 5000,
				})
				localStorage.setItem('warning_shown', true.toString())
			} else {
				game.reset()
				game.state = 'editing'
			}
		}
	}

	function update_URL(pieces_config: string, rows_config: string, cols_config: string) {
		const url = new URL(window.location.origin)

		update_URL_param(url, 'pieces', pieces_config)
		update_URL_param(url, 'rows', rows_config)
		update_URL_param(url, 'cols', cols_config)

		window.history.replaceState({}, '', url)
	}

	async function share_URL() {
		await navigator.clipboard.writeText(window.location.href)

		send_toast({
			variant: 'info',
			title: 'URL copied to clipboard',
		})
	}

	function load_challenge(
		pieces_config: string,
		rows_config: string,
		cols_config: string,
		options: { update_URL: boolean },
	) {
		if (pieces_config) {
			try {
				game.pieces = Encoder.decode_pieces_config(pieces_config)
				game.update_pieces_array()
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid pieces in URL',
				})
				return
			}
		}

		if (rows_config) {
			try {
				game.row_connections = Encoder.decode_sets(rows_config)
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid rows in URL',
				})
				return
			}
		}

		if (cols_config) {
			try {
				game.col_connections = Encoder.decode_sets(cols_config)
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid cols in URL',
				})
				return
			}
		}

		if (options.update_URL) {
			update_URL(pieces_config, rows_config, cols_config)
		}
	}

	function load_config_from_URL() {
		const url = new URL(window.location.href)
		const pieces_config = url.searchParams.get('pieces')
		const rows_config = url.searchParams.get('rows')
		const cols_config = url.searchParams.get('cols')
		load_challenge(pieces_config ?? '', rows_config ?? '', cols_config ?? '', {
			update_URL: false,
		})
	}

	onMount(() => {
		load_config_from_URL()
		document.addEventListener('dragover', (e) => e.preventDefault())
		document.addEventListener('drop', (e) => e.preventDefault())
	})

	function handle_keydown(e: KeyboardEvent) {
		const delta = e.shiftKey ? -1 : 1
		const row = ROW_KEYS.findIndex((row) => row === e.code)
		if (row >= 0) {
			try {
				const move = new Move('row', row, delta)
				game.execute_move(move)
			} catch (err) {
				send_toast({
					title: (err as Error).message,
					variant: 'error',
				})
			}
			return
		}

		const col = COL_KEYS.findIndex((col) => col === e.code)
		if (col >= 0) {
			try {
				const move = new Move('col', col, delta)
				game.execute_move(move)
			} catch (err) {
				send_toast({
					title: (err as Error).message,
					variant: 'error',
				})
			}
		}
	}
</script>

<svelte:window onkeydown={handle_keydown} />

<Header />

<div class="grid" class:show_torus>
	<div class="game_container">
		{#if game.state !== 'editing'}
			<div class="move_count">{game.move_count} moves</div>
		{/if}
		<Game />
	</div>

	<Menu
		scramble={() => game.scramble()}
		reset={() => game.reset()}
		{toggle_torus}
		{show_torus}
		{toggle_editing}
		revert_edits={() => game.revert_edits()}
		{share_URL}
	/>

	{#if game.state === 'editing'}
		<Instructions />
	{/if}

	{#if show_torus}
		<Torus pieces_array={game.pieces_array} bind:torus_rotating />
	{/if}

	{#if game.state !== 'editing'}
		<Challenges
			load_challenge={(pieces_config, rows_config, cols_config) =>
				load_challenge(pieces_config, rows_config, cols_config, {
					update_URL: true,
				})}
		/>
		<Infos />
	{/if}
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

		@media (min-width: 720px) {
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
</style>
