<script lang="ts">
	import Game from './lib/Game.svelte'
	import Header from './lib/Header.svelte'
	import Infos from './lib/Infos.svelte'
	import Menu from './lib/Menu.svelte'
	import {
		create_piece_array,
		encode_pieces,
		reset_pieces_positions,
		scramble_pieces,
		revert_pieces_edits,
		decode_config,
		execute_row_move,
		execute_col_move,
		game,
	} from './game.svelte'
	import Torus from './lib/Torus.svelte'
	import Toast, { send_toast } from './lib/Toast.svelte'
	import { onMount } from 'svelte'
	import Instructions from './lib/Instructions.svelte'
	import Challenges from './lib/Challenges.svelte'
	import { decode_sets, encode_sets } from './utils'
	import { COL_KEYS, ROW_KEYS } from './config'
	import type { Piece } from './piece.svelte'

	let pieces_array = $state<Piece[][]>(create_piece_array())

	let row_connections = $state<number[][]>([])
	let col_connections = $state<number[][]>([])

	let show_torus = $state(false)
	let torus_rotating = $state(true)

	let move_count = $state(0)

	function reset() {
		if (game.state !== 'idle') return
		reset_pieces_positions()
		update_pieces_array()
		move_count = 0
	}

	async function scramble() {
		if (game.state !== 'idle') return
		game.state = 'scrambling'
		await scramble_pieces(row_connections, col_connections, 10)
		update_pieces_array()
		game.state = 'idle'
		move_count = 0
	}

	function toggle_torus() {
		show_torus = !show_torus
	}

	function update_pieces_array() {
		pieces_array = create_piece_array()
	}

	function toggle_editing() {
		if (game.state === 'editing') {
			game.state = 'idle'
			update_URL(null, null, null)
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
				reset()
				game.state = 'editing'
			}
		}
	}

	function update_URL(
		pieces_config: string | null,
		rows_config: string | null,
		cols_config: string | null,
	) {
		pieces_config ??= encode_pieces()
		rows_config ??= encode_sets(row_connections)
		cols_config ??= encode_sets(col_connections)

		const url = new URL(window.location.origin)

		if (pieces_config) {
			url.searchParams.set('pieces', pieces_config)
		} else {
			url.searchParams.delete('pieces')
		}
		if (rows_config) {
			url.searchParams.set('rows', rows_config)
		} else {
			url.searchParams.delete('rows')
		}
		if (cols_config) {
			url.searchParams.set('cols', cols_config)
		} else {
			url.searchParams.delete('cols')
		}

		window.history.replaceState({}, '', url)
	}

	function revert_edits() {
		if (game.state === 'editing') {
			revert_pieces_edits()
			clear_connections()
		}
	}

	async function share_URL() {
		await navigator.clipboard.writeText(window.location.href)

		send_toast({
			variant: 'info',
			title: 'URL copied to clipboard',
		})
	}

	function load_challenge(
		pieces_config: string | null,
		rows_config: string | null,
		cols_config: string | null,
		options: { update_URL: boolean },
	) {
		if (pieces_config !== null) {
			try {
				decode_config(pieces_config)
				update_pieces_array()
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid config in URL',
				})
				return
			}
		}

		if (rows_config !== null) {
			try {
				row_connections = decode_sets(rows_config)
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid rows in URL',
				})
			}
		}

		if (cols_config !== null) {
			try {
				col_connections = decode_sets(cols_config)
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid cols in URL',
				})
			}
		}

		if (options.update_URL) update_URL(pieces_config, rows_config, cols_config)
	}

	function load_config_from_URL() {
		const url = new URL(window.location.href)
		const pieces_config = url.searchParams.get('pieces')
		const rows_config = url.searchParams.get('rows')
		const cols_config = url.searchParams.get('cols')
		load_challenge(pieces_config, rows_config, cols_config, { update_URL: false })
	}

	function clear_connections() {
		row_connections = []
		col_connections = []
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
				execute_row_move(row_connections, row, delta)
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
				execute_col_move(col_connections, col, delta)
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
			<div class="move_count">{move_count} moves</div>
		{/if}
		<Game
			{update_pieces_array}
			bind:move_count
			bind:row_connections
			bind:col_connections
		/>
	</div>

	<Menu
		{scramble}
		{reset}
		{toggle_torus}
		{show_torus}
		{toggle_editing}
		{revert_edits}
		{share_URL}
	/>

	{#if game.state === 'editing'}
		<Instructions />
	{/if}

	{#if show_torus}
		<Torus {pieces_array} bind:torus_rotating />
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
