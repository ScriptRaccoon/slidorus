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
		toggle_torus: () => void
		show_torus: boolean
		toggle_editing: () => void
		revert_edits: () => void
		share_URL: () => void
		undo_move: () => void
	}

	let {
		scramble,
		reset,
		toggle_torus,
		show_torus,
		toggle_editing,
		revert_edits,
		share_URL,
		undo_move,
	}: Props = $props()
</script>

<menu>
	{#if game.state !== 'editing'}
		<button onclick={scramble} disabled={game.state !== 'idle'}>
			<Shuffle /> Scramble
		</button>
		<button onclick={reset} disabled={game.state !== 'idle'}>
			<RotateCcw /> Reset
		</button>
		<button onclick={undo_move} disabled={game.move_count === 0}>
			<Undo /> Undo
		</button>
		<button onclick={toggle_torus}>
			{#if show_torus}
				<EyeOff /> Hide Torus
			{:else}
				<Eye /> Show Torus
			{/if}
		</button>

		<button onclick={toggle_editing} disabled={game.state !== 'idle'}>
			<SquarePen /> Edit
		</button>

		<button onclick={share_URL} class="share">
			<Link2 /> Share
		</button>
	{:else}
		<button onclick={revert_edits}>
			<RotateCcw /> Revert
		</button>
		<button onclick={toggle_editing}>
			<CircleCheck /> Done
		</button>
	{/if}
</menu>

<style>
	menu {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		justify-content: center;
		gap: 0.5rem 1rem;
	}

	button {
		padding: 0.3rem 0.75rem;
		background-color: var(--btn-color);
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		white-space: nowrap;
	}

	@media (max-width: 720px) {
		menu {
			gap: 0.5rem;
		}

		button {
			font-size: 0.875rem;
		}
	}
</style>
