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
	import { app } from '../config.svelte'

	type Props = {
		scramble: () => void
		reset: () => void
		toggle_torus: () => void
		show_torus: boolean
		toggle_editing: () => void
		revert_edits: () => void
		share_URL: () => void
	}

	let {
		scramble,
		reset,
		toggle_torus,
		show_torus,
		toggle_editing,
		revert_edits,
		share_URL,
	}: Props = $props()
</script>

<menu>
	{#if app.state !== 'editing'}
		<button onclick={scramble} disabled={app.state !== 'idle'}>
			<Shuffle /> Scramble
		</button>
		<button onclick={reset} disabled={app.state !== 'idle'}>
			<RotateCcw /> Reset
		</button>
		<button onclick={toggle_torus}>
			{#if show_torus}
				<EyeOff /> Hide Torus
			{:else}
				<Eye /> Show Torus
			{/if}
		</button>

		<button onclick={toggle_editing} disabled={app.state !== 'idle'}>
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
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		margin-top: 1.25rem;
	}

	button {
		padding: 0.3rem 0.75rem;
		background-color: var(--btn-color);
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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
