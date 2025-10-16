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
	import {
		type Challenge,
		type GameConfig,
		get_config_from_URL,
		update_URL,
	} from './core/challenge'
	import Solves from './lib/Solves.svelte'
	import ChallengeSelector from './lib/ChallengeSelector.svelte'
	import MoveHistory from './lib/MoveHistory.svelte'
	import PieceGrid from './lib/PieceGrid.svelte'
	import Connectors from './lib/Connectors.svelte'
	import { CHALLENGES } from './data/challenges'
	import { equal_objects } from './core/utils'

	let show_torus = $state(false)
	let torus_rotating = $state(true)
	let torus_piece_grid = $state<Piece[][]>([])
	let square_size = $state(0)
	let show_challenge_selector = $state(false)
	let current_challenge = $state<Challenge | undefined>(undefined)
	let challenge_name = $derived(
		current_challenge ? current_challenge.name : 'Custom Challenge',
	)

	function load_config_from_URL() {
		const config = get_config_from_URL()
		game.load_from_config(config)
		update_challenge(config)
	}

	function update_challenge(config: GameConfig) {
		current_challenge = CHALLENGES.find((challenge) =>
			equal_objects(challenge.config, config),
		)
	}

	function toggle_editing() {
		if (game.state === 'editing') {
			finish_editing()
		} else if (game.state === 'idle') {
			start_editing()
		}
	}

	function start_editing() {
		if (game.move_count > 10) {
			const confirmed = window.confirm(
				'Editing will reset the puzzle. Are you sure?',
			)
			if (!confirmed) return
		}
		game.reset()
		game.state = 'editing'
	}

	function finish_editing() {
		game.state = 'idle'
		const config = game.get_config()
		update_URL(config)
		update_challenge(config)
	}

	function reset() {
		if (game.move_count > 10) {
			const confirmed = window.confirm(
				'This will reset the puzzle. Are you sure?',
			)
			if (!confirmed) return
		}
		game.reset()
	}

	function toggle_torus() {
		show_torus = !show_torus
	}

	async function copy_URL() {
		await navigator.clipboard.writeText(window.location.href)

		send_toast({
			variant: 'info',
			title: 'URL copied to clipboard',
		})
	}

	function undo_move() {
		const { error } = game.undo_move()
		if (error) send_toast({ variant: 'error', title: error })
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

	onMount(() => {
		load_config_from_URL()
		document.addEventListener('dragover', (e) => e.preventDefault())
		document.addEventListener('drop', (e) => e.preventDefault())
	})
</script>

<Header {challenge_name} bind:show_challenge_selector />

<div class="grid" class:show_torus>
	<main class="game" style:--size="{square_size}px">
		<MoveHistory />
		<PieceGrid bind:square_size {challenge_name} />
		<Connectors />
	</main>

	<Menu
		scramble={() => game.scramble()}
		{reset}
		{toggle_torus}
		{undo_move}
		{toggle_editing}
		{show_torus}
		revert_edits={() => game.revert_edits()}
		{copy_URL}
	/>

	{#if game.state === 'editing'}
		<Instructions />
	{/if}

	{#if show_torus}
		<Torus {torus_piece_grid} bind:torus_rotating />
	{/if}

	{#if game.state !== 'editing'}
		<ChallengeSelector
			bind:current_challenge
			bind:open={show_challenge_selector}
		/>
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
