<script lang="ts">
	import Header from './lib/Header.svelte'
	import Menu from './lib/Menu.svelte'
	import Torus from './lib/Torus.svelte'
	import Toast, { send_toast } from './lib/Toast.svelte'
	import { onMount } from 'svelte'
	import Instructions from './lib/Instructions.svelte'
	import { game } from './core/game.svelte'
	import type { Piece } from './core/piece.svelte'
	import About from './lib/About.svelte'
	import { get_config_from_URL, update_URL } from './core/challenge'
	import Solves from './lib/Solves.svelte'
	import ChallengeSelector from './lib/ChallengeSelector.svelte'
	import MoveHistory from './lib/MoveHistory.svelte'
	import PieceGrid from './lib/PieceGrid.svelte'
	import Connectors from './lib/Connectors.svelte'

	let show_torus = $state(false)
	let torus_rotating = $state(true)
	let torus_piece_grid = $state<Piece[][]>([])
	let show_challenge_selector = $state(false)
	let square_size = $state(0)

	function toggle_torus() {
		show_torus = !show_torus
	}

	function toggle_editing() {
		if (game.state === 'editing') {
			game.state = 'idle'
			update_URL(game.get_config())
			game.update_challenge()
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

	async function share_URL() {
		await navigator.clipboard.writeText(window.location.href)

		send_toast({
			variant: 'info',
			title: 'URL copied to clipboard',
		})
	}

	function load_config_from_URL() {
		const config = get_config_from_URL()
		game.load_from_config(config)
		game.update_challenge()
	}

	onMount(() => {
		load_config_from_URL()
		document.addEventListener('dragover', (e) => e.preventDefault())
		document.addEventListener('drop', (e) => e.preventDefault())
	})

	function update_torus_grid(pieces: Piece[]) {
		const grid: Piece[][] = []
		for (const piece of pieces) {
			if (!grid[piece.y]) grid[piece.y] = []
			grid[piece.y][piece.x] = piece
		}
		torus_piece_grid = grid
	}

	function open_challenge_selector() {
		if (game.state !== 'idle') return
		show_challenge_selector = true
	}

	$effect(() => {
		if (game.state !== 'scrambling') {
			update_torus_grid(game.pieces)
		}
	})

	function undo_move() {
		const { error } = game.undo_move()
		if (error) send_toast({ variant: 'error', title: error })
	}
</script>

<Header
	challenge_name={game.challenge?.name ?? 'Custom Challenge'}
	{open_challenge_selector}
/>

<div class="grid" class:show_torus>
	<div class="game" style:--size="{square_size}px">
		<MoveHistory />
		<PieceGrid bind:square_size />
		<Connectors />
	</div>

	<Menu
		scramble={() => game.scramble()}
		reset={() => game.reset()}
		{toggle_torus}
		{undo_move}
		{toggle_editing}
		{show_torus}
		revert_edits={() => game.revert_edits()}
		{share_URL}
	/>

	{#if game.state === 'editing'}
		<Instructions />
	{/if}

	{#if show_torus}
		<Torus {torus_piece_grid} bind:torus_rotating />
	{/if}

	{#if game.state !== 'editing'}
		<ChallengeSelector bind:open={show_challenge_selector} />
		<Solves />
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

	.game {
		--u: calc(var(--size) / 9);
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto 1fr auto;
	}
</style>
