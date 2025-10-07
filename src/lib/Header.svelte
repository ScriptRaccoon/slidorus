<script lang="ts">
	import { fade } from 'svelte/transition'

	import { Trophy } from '@lucide/svelte'

	type Props = {
		challenge_name: string
	}

	let { challenge_name }: Props = $props()
</script>

<header>
	<h1>Slidorus</h1>

	{#if challenge_name}
		<span class="challenge_name" transition:fade={{ duration: 200 }}
			><Trophy /> {challenge_name}</span
		>
	{/if}
</header>

<style>
	header {
		padding-block: 1rem;
		text-align: center;
		display: flex;
		justify-content: space-between;
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

	.challenge_name {
		font-family: monospace;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
	}

	@media (min-width: 720px) {
		header {
			padding-block: 1.5rem;
		}

		h1 {
			font-size: 2.5rem;
			flex: 1;
		}

		.challenge_name {
			background-color: var(--btn-color);
			position: absolute;
			top: 0;
			right: 0;
			border-bottom-left-radius: 0.5rem;
			box-shadow: 0 0 1rem #0004;
			padding: 0.5rem 1rem;
			font-size: 1rem;
		}
	}
</style>
