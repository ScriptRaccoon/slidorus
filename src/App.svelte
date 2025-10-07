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
	import { update_URL_param } from './core/utils'
	import { game } from './core/game.svelte'
	import MoveHistory from './lib/MoveHistory.svelte'
	import type { Piece } from './core/piece.svelte'

	let show_torus = $state(false)
	let torus_rotating = $state(true)
	let torus_piece_grid = $state<Piece[][]>([])

	function toggle_torus() {
		show_torus = !show_torus
	}

	function update_torus_pieces() {
		const grid: Piece[][] = []
		for (const piece of game.pieces) {
			if (!grid[piece.y]) grid[piece.y] = []
			grid[piece.y][piece.x] = piece
		}
		torus_piece_grid = grid
	}

	function toggle_editing() {
		if (game.state === 'editing') {
			game.state = 'idle'
			update_URL(game.pieces_config, game.rows_config, game.cols_config)
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
		pieces_config: string | null,
		rows_config: string | null,
		cols_config: string | null,
		options: { update_URL: boolean },
	) {
		if (pieces_config !== null) {
			try {
				game.decode_pieces(pieces_config)
				update_torus_pieces()
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid pieces in URL',
				})
				return
			}
		}

		if (rows_config !== null) {
			try {
				game.decode_rows(rows_config)
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid rows in URL',
				})
				return
			}
		}

		if (cols_config !== null) {
			try {
				game.decode_cols(cols_config)
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid cols in URL',
				})
				return
			}
		}

		game.clear_move_history()

		if (options.update_URL) {
			update_URL(pieces_config, rows_config, cols_config)
		}
	}

	function load_config_from_URL() {
		const url = new URL(window.location.href)
		const pieces_config = url.searchParams.get('pieces')
		const rows_config = url.searchParams.get('rows')
		const cols_config = url.searchParams.get('cols')
		load_challenge(pieces_config, rows_config, cols_config, {
			update_URL: false,
		})
	}

	function reset() {
		game.reset()
		update_torus_pieces()
	}

	async function scramble() {
		await game.scramble()
		update_torus_pieces()
	}

	onMount(() => {
		load_config_from_URL()
		document.addEventListener('dragover', (e) => e.preventDefault())
		document.addEventListener('drop', (e) => e.preventDefault())
	})

	function finish_move() {
		update_torus_pieces()

		const is_solved = game.check_solved()

		if (is_solved) {
			send_toast({
				title: 'Puzzle solved!',
				variant: 'success',
			})
		}
	}
</script>

<Header />

<div class="grid" class:show_torus>
	<div class="game_container">
		{#if game.state !== 'editing'}
			<MoveHistory />
		{/if}
		<Game {finish_move} />
	</div>

	<Menu
		{scramble}
		{reset}
		{toggle_torus}
		{show_torus}
		{toggle_editing}
		revert_edits={() => game.revert_edits()}
		{share_URL}
		undo_move={() => game.undo_move()}
	/>

	{#if game.state === 'editing'}
		<Instructions />
	{/if}

	{#if show_torus}
		<Torus {torus_piece_grid} bind:torus_rotating />
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
</style>
