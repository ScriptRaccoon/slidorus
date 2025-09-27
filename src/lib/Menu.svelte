<script lang="ts">
	type Props = {
		scramble: () => void
		reset: () => void
		toggle_torus: () => void
		show_torus: boolean
	}

	let { scramble, reset, toggle_torus, show_torus }: Props = $props()
</script>

<menu>
	<button onclick={scramble}>Scramble</button>
	<button onclick={reset}>Reset</button>
	<button onclick={toggle_torus}>
		{#if show_torus}
			Hide Torus
		{:else}
			Show Torus
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
	}
</style>
