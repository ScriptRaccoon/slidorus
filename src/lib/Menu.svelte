<script lang="ts">
	import {
		CircleCheck,
		Eye,
		EyeOff,
		Link2,
		List,
		RotateCcw,
		Shuffle,
		SquarePen,
		Undo,
	} from '@lucide/svelte'
	import { game } from '../core/game.svelte'

	type Props = {
		open_challenge_selector: () => void
		scramble: () => void
		reset: () => void
		undo_move: () => void
		toggle_torus: () => void
		show_torus: boolean
		toggle_editing: () => void
		revert_edits: () => void
		share_URL: () => void
	}

	let {
		open_challenge_selector,
		scramble,
		reset,
		undo_move,
		toggle_torus,
		show_torus,
		toggle_editing,
		revert_edits,
		share_URL,
	}: Props = $props()
</script>

<menu>
	{#if game.state !== 'editing'}
		<button
			onclick={open_challenge_selector}
			aria-label="Open list of challenges"
		>
			<List />
		</button>
		<button
			onclick={scramble}
			disabled={game.state !== 'idle'}
			aria-label="Scramble"
		>
			<Shuffle />
		</button>
		<button
			onclick={reset}
			disabled={game.state !== 'idle'}
			aria-label="Reset"
		>
			<RotateCcw />
		</button>
		<button
			onclick={undo_move}
			disabled={game.move_count === 0}
			aria-label="Undo"
		>
			<Undo />
		</button>
		<button onclick={toggle_torus} aria-label="Toggle Torus">
			{#if show_torus}
				<EyeOff />
			{:else}
				<Eye />
			{/if}
		</button>

		<button
			onclick={toggle_editing}
			disabled={game.state !== 'idle'}
			aria-label="Edit"
		>
			<SquarePen />
		</button>

		<button onclick={share_URL} class="share" aria-label="Share">
			<Link2 />
		</button>
	{:else}
		<button onclick={revert_edits} aria-label="Revert">
			<RotateCcw />
		</button>
		<button onclick={toggle_editing} aria-label="Done">
			<CircleCheck />
		</button>
	{/if}
</menu>

<style>
	menu {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	button {
		padding: 0.3rem 0.8rem;
		background-color: var(--btn-color);
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	@media (min-width: 500px) {
		menu {
			gap: 1rem;
		}
		button {
			padding: 0.35rem 0.9rem;
			flex: unset;
		}
	}
</style>
