<script lang="ts">
	type Props = {
		challenge_name: string
	}

	let { challenge_name }: Props = $props()
</script>

<header>
	<h1>Slidorus</h1>
	{#if challenge_name}
		<h2>{challenge_name}</h2>
	{/if}
</header>

<style>
	header {
		padding-block: 1rem;
		text-align: center;
	}

	h1 {
		font-size: 1.75rem;
		font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
			'Lucida Sans', Arial, sans-serif;
		text-transform: uppercase;
		font-weight: 600;
		color: var(--highlight-color);
		letter-spacing: 2px;
	}

	h2 {
		margin-top: -0.25rem;
		font-weight: 300;
		font-size: 0.875rem;
		font-family: monospace;
	}

	@media (min-width: 720px) {
		header {
			padding-block: 1.5rem;
		}

		h1 {
			font-size: 2.5rem;
		}

		h2 {
			font-size: 1.125rem;
		}
	}
</style>
