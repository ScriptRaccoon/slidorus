<script lang="ts">
	import {
		CircleCheck,
		Eye,
		EyeOff,
		Link2,
		RotateCcw,
		Shuffle,
		SquarePen,
	} from '@lucide/svelte'
	import type { APP_STATE } from './types'

	type Props = {
		scramble: () => void
		reset: () => void
		toggle_torus: () => void
		show_torus: boolean
		toggle_editing: () => void
		revert_edits: () => void
		share: () => void
		app_state: APP_STATE
	}

	let {
		scramble,
		reset,
		toggle_torus,
		show_torus,
		toggle_editing,
		revert_edits,
		share,
		app_state,
	}: Props = $props()
</script>

<menu>
	{#if app_state !== 'editing'}
		<button onclick={scramble} disabled={app_state !== 'idle'}>
			<Shuffle /> Scramble
		</button>
		<button onclick={reset} disabled={app_state !== 'idle'}>
			<RotateCcw /> Reset
		</button>
		<button onclick={toggle_torus}>
			{#if show_torus}
				<EyeOff /> Hide Torus
			{:else}
				<Eye /> Show Torus
			{/if}
		</button>

		<button onclick={toggle_editing} disabled={app_state !== 'idle'}>
			<SquarePen /> Edit
		</button>

		<button onclick={share} class="share">
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
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	button {
		padding: 0.3rem 0.75rem;
		background-color: var(--btn-color);
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;

		&:focus-visible,
		&:hover {
			outline: 1px solid var(--outline-color);
		}

		&:disabled {
			cursor: not-allowed;
		}
	}

	@media (max-width: 720px) {
		menu {
			justify-content: center;
			gap: 0.5rem;
		}

		button {
			font-size: 0.875rem;
			padding: 0.3rem 0.6rem;
		}
	}
</style>
