<script lang="ts">
	import Game from './lib/Game.svelte'
	import Header from './lib/Header.svelte'
	import Menu from './lib/Menu.svelte'
	import Torus from './lib/Torus.svelte'
	import Toast, { send_toast } from './lib/Toast.svelte'
	import { onMount } from 'svelte'
	import Instructions from './lib/Instructions.svelte'
	import ChallengeSelector from './lib/ChallengeSelector.svelte'
	import { update_URL_param } from './core/utils'
	import { game } from './core/game.svelte'
	import type { Piece } from './core/piece.svelte'
	import About from './lib/About.svelte'
	import type { Challenge } from './core/config'
	import challenges from './data/challenges.json'

	let show_torus = $state(false)
	let torus_rotating = $state(true)
	let torus_piece_grid = $state<Piece[][]>([])

	let challenge_name = $state('')

	function toggle_torus() {
		show_torus = !show_torus
	}

	function toggle_editing() {
		if (game.state === 'editing') {
			game.state = 'idle'
			const challenge: Challenge = {}
			if (game.pieces_config) challenge.pieces = game.pieces_config
			if (game.rows_config) challenge.rows = game.rows_config
			if (game.cols_config) challenge.cols = game.cols_config
			update_challenge_name(challenge)
			update_URL(challenge)
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

	function update_URL(challenge: Challenge) {
		const url = new URL(window.location.origin)

		update_URL_param(url, 'pieces', challenge.pieces)
		update_URL_param(url, 'rows', challenge.rows)
		update_URL_param(url, 'cols', challenge.cols)

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
		challenge: Challenge,
		options: { update_URL: boolean },
	) {
		if (challenge.pieces) {
			try {
				game.decode_pieces(challenge.pieces)
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid pieces in URL',
				})
				return
			}
		}

		if (challenge.rows) {
			try {
				game.decode_rows(challenge.rows)
			} catch (err) {
				console.error(err)
				send_toast({
					variant: 'error',
					title: 'Invalid rows in URL',
				})
				return
			}
		}

		if (challenge.cols) {
			try {
				game.decode_cols(challenge.cols)
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
		update_challenge_name(challenge)

		if (options.update_URL) {
			update_URL(challenge)
		}
	}

	function load_config_from_URL() {
		const url = new URL(window.location.href)
		const pieces_config = url.searchParams.get('pieces')
		const rows_config = url.searchParams.get('rows')
		const cols_config = url.searchParams.get('cols')
		const challenge: Challenge = {}
		if (pieces_config) challenge.pieces = pieces_config
		if (rows_config) challenge.rows = rows_config
		if (cols_config) challenge.cols = cols_config

		load_challenge(challenge, { update_URL: false })
	}

	function update_challenge_name(challenge: Challenge) {
		const saved_challenge = challenges.find(
			(c) =>
				c.pieces == challenge.pieces &&
				c.rows == challenge.rows &&
				c.cols == challenge.cols,
		)
		challenge_name = saved_challenge ? saved_challenge.name : ''
	}

	onMount(() => {
		load_config_from_URL()
		document.addEventListener('dragover', (e) => e.preventDefault())
		document.addEventListener('drop', (e) => e.preventDefault())
	})

	function finish_move() {
		const is_solved = game.check_solved()

		if (is_solved) {
			send_toast({
				title: 'Puzzle solved!',
				variant: 'success',
			})
		}
	}

	function update_torus_grid(pieces: Piece[]) {
		const grid: Piece[][] = []
		for (const piece of pieces) {
			if (!grid[piece.y]) grid[piece.y] = []
			grid[piece.y][piece.x] = piece
		}
		torus_piece_grid = grid
	}

	$effect(() => {
		if (game.state !== 'scrambling') {
			update_torus_grid(game.pieces)
		}
	})
</script>

<Header {challenge_name} />

<div class="grid" class:show_torus>
	<Game {finish_move} />

	<Menu
		scramble={() => game.scramble()}
		reset={() => game.reset()}
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
		<ChallengeSelector
			load_challenge={(challenge) =>
				load_challenge(challenge, { update_URL: true })}
		/>
		<About />
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
</style>
