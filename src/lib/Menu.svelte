<script lang="ts">
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
		<button onclick={scramble} disabled={app_state !== 'idle'}>Scramble</button>
		<button onclick={reset} disabled={app_state !== 'idle'}>Reset</button>
		<button onclick={toggle_torus}>
			{#if show_torus}
				Hide Torus
			{:else}
				Show Torus
			{/if}
		</button>
	{:else}
		<button onclick={reset_bandaging}>Reset bandaging</button>
	{/if}

	<button
		onclick={toggle_bandaging}
		disabled={app_state !== 'idle' && app_state !== 'bandaging'}
	>
		{#if app_state == 'bandaging'}
			Done
		{:else}
			Bandage
		{/if}
	</button>
</menu>

<style>
	menu {
		margin-top: 2rem;
		padding-inline: 1rem;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	button {
		padding: 0.25rem 0.8rem;
		background-color: var(--btn-color);
		border-radius: 0.25rem;

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
			margin-top: 1rem;
			gap: 0.5rem 0.75rem;
		}
		button {
			font-size: 0.825rem;
			padding: 0.2rem 0.6rem;
		}
	}
</style>
