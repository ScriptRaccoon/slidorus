<script lang="ts">
	import { Bandage, CircleCheck, Eye, EyeOff, RotateCcw, Shuffle } from '@lucide/svelte'
	import type { APP_STATE } from './types'

	type Props = {
		scramble: () => void
		reset: () => void
		toggle_torus: () => void
		show_torus: boolean
		toggle_bandaging: () => void
		reset_bandaging: () => void
		app_state: APP_STATE
	}

	let {
		scramble,
		reset,
		toggle_torus,
		show_torus,
		toggle_bandaging,
		reset_bandaging,
		app_state,
	}: Props = $props()
</script>

<menu>
	{#if app_state !== 'bandaging'}
		<button onclick={scramble} disabled={app_state !== 'idle'}>
			<Shuffle />
			Scramble
		</button>
		<button onclick={reset} disabled={app_state !== 'idle'}>
			<RotateCcw />
			Reset
		</button>
		<button onclick={toggle_torus}>
			{#if show_torus}
				<EyeOff /> Hide Torus
			{:else}
				<Eye /> Show Torus
			{/if}
		</button>
	{:else}
		<button onclick={reset_bandaging}>
			<RotateCcw />
			Reset
		</button>
	{/if}

	<button
		onclick={toggle_bandaging}
		disabled={app_state !== 'idle' && app_state !== 'bandaging'}
	>
		{#if app_state == 'bandaging'}
			<CircleCheck /> Done
		{:else}
			<Bandage /> Bandage
		{/if}
	</button>
</menu>

<style>
	menu {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	button {
		padding: 0.3rem 0.8rem;
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

	@media (max-width: 540px) {
		menu {
			gap: 0.5rem;
			display: grid;
			grid-template-columns: repeat(2, 1fr);
		}
		button {
			font-size: 0.875rem;
			padding: 0.3rem 0.6rem;
		}
	}
</style>
