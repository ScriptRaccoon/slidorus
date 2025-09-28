<script lang="ts">
	type Props = {
		scramble: () => void
		reset: () => void
		toggle_torus: () => void
		show_torus: boolean
		toggle_bandaging: () => void
		is_bandaging: boolean
		reset_bandaging: () => void
		is_moving: boolean
	}

	let {
		scramble,
		reset,
		toggle_torus,
		show_torus,
		toggle_bandaging,
		is_bandaging,
		reset_bandaging,
		is_moving,
	}: Props = $props()
</script>

<menu>
	{#if !is_bandaging}
		<button onclick={scramble} disabled={is_moving}>Scramble</button>
		<button onclick={reset} disabled={is_moving}>Reset</button>
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

	<button onclick={toggle_bandaging} disabled={is_moving}>
		{#if is_bandaging}
			Done
		{:else}
			Bandage
		{/if}
	</button>
</menu>

<style>
	menu {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;

		@media (min-width: 600px) {
			margin-top: 2rem;
		}
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
</style>
