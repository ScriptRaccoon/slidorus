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
	import { type Challenge, type GameConfig, CONFIG_KEYS } from './core/config'
	import Solves from './lib/Solves.svelte'
	import ChallengeSelector from './lib/ChallengeSelector.svelte'
	import MoveHistory from './lib/MoveHistory.svelte'
	import PieceGrid from './lib/PieceGrid.svelte'
	import Connectors from './lib/Connectors.svelte'
	import { CHALLENGES } from './data/challenges'
	import { equal_objects } from './core/utils'
	import Modal from './lib/Modal.svelte'
	import { open_modal } from './core/modal.svelte'

	let show_torus = $state(false)
	let torus_rotating = $state(true)
	let square_size = $state(0)
	let show_challenge_selector = $state(false)
	let current_challenge = $state<Challenge | undefined>(undefined)
	let challenge_name = $derived(
		current_challenge ? current_challenge.name : 'Custom Challenge',
	)

	function load_config_from_URL() {
		const url = new URL(window.location.href)
		const config = Object.fromEntries(
			CONFIG_KEYS.map((key) => [key, url.searchParams.get(key) ?? '']),
		) as GameConfig
		game.load_from_config(config)
		update_challenge(config)
	}

	function update_URL(config: GameConfig) {
		const url = new URL(window.location.origin)

		for (const key of CONFIG_KEYS) {
			const val = config[key]
			val ? url.searchParams.set(key, val) : url.searchParams.delete(key)
		}

		window.history.replaceState({}, '', url)
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
		const edit_action = () => {
			game.reset_pieces()
			game.state = 'editing'
		}

		if (game.move_count <= 10) {
			edit_action()
		} else {
			open_modal(
				'Editing will reset the puzzle. Are you sure?',
				edit_action,
			)
		}
	}

	function finish_editing() {
		game.state = 'idle'
		const config = game.get_config()
		update_URL(config)
		update_challenge(config)
		game.load_progress()
	}

	function reset() {
		if (game.move_count <= 10) {
			game.reset()
		} else {
			open_modal('This will reset the puzzle. Are you sure?', () =>
				game.reset(),
			)
		}
	}

	function toggle_torus() {
		show_torus = !show_torus
	}

	async function copy_URL() {
		await navigator.clipboard.writeText(window.location.href)
		send_toast({ variant: 'info', title: 'URL copied to clipboard' })
	}

	function undo_move() {
		const { error } = game.undo_move()
		if (error) send_toast({ variant: 'error', title: error })
	}

	function scramble() {
		if (game.move_count <= 10 || !game.has_scramble) {
			game.execute_scramble()
		} else {
			open_modal(
				'This will scramble the puzzle. You will loose your progress. Are you sure?',
				() => {
					game.execute_scramble()
				},
			)
		}
	}

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
		{scramble}
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
		<Torus pieces={game.pieces} bind:torus_rotating />
	{/if}

	{#if game.state !== 'editing'}
		<ChallengeSelector
			bind:current_challenge
			bind:open={show_challenge_selector}
			{update_URL}
		/>
		<Solves />
		<About />
	{/if}
</div>

<Toast position="bottom-center" />

<Modal />

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
