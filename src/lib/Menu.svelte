<script lang="ts">
	import {
		CircleCheck,
		Eye,
		EyeOff,
		Link2,
		RotateCcw,
		Shuffle,
		SquarePen,
		Undo,
	} from '@lucide/svelte'
	import { game } from '../core/game.svelte'

	type Props = {
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
			class="btn"
			onclick={scramble}
			disabled={game.state !== 'idle'}
			aria-label="Scramble"
		>
			<Shuffle />
		</button>
		<button
			class="btn"
			onclick={reset}
			disabled={game.state !== 'idle'}
			aria-label="Reset"
		>
			<RotateCcw />
		</button>
		<button
			class="btn"
			onclick={undo_move}
			disabled={game.move_count === 0}
			aria-label="Undo"
		>
			<Undo />
		</button>
		<button
			class="btn"
			onclick={toggle_torus}
			aria-label="Toggle Torus"
			aria-pressed={show_torus}
		>
			{#if show_torus}
				<EyeOff />
			{:else}
				<Eye />
			{/if}
		</button>

		<button
			class="btn"
			onclick={toggle_editing}
			disabled={game.state !== 'idle'}
			aria-label="Edit"
		>
			<SquarePen />
		</button>

		<button class="btn" onclick={share_URL} aria-label="Share URL">
			<Link2 />
		</button>
	{:else}
		<button class="btn" onclick={revert_edits} aria-label="Revert">
			<RotateCcw />
		</button>
		<button class="btn" onclick={toggle_editing} aria-label="Done">
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
