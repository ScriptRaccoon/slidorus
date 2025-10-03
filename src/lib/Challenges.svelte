<script lang="ts">
	import { Trophy } from '@lucide/svelte'
	import challenges from '../data/challenges.json'

	type Props = {
		load_challenge: (config: string, rows: string, cols: string) => void
	}

	let { load_challenge }: Props = $props()
</script>

<details>
	<summary>
		<Trophy /> Challenges
	</summary>

	<ol>
		{#each challenges as challenge}
			<li>
				<button
					onclick={() =>
						load_challenge(challenge.config, challenge.rows, challenge.cols)}
				>
					{challenge.name}
				</button>
			</li>
		{/each}
	</ol>
</details>

<style>
	ol {
		margin-top: 1rem;
		list-style-type: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.6rem;
	}

	button {
		outline: 0.1rem solid var(--dark-outline-color);
		border-radius: 0.25rem;
		padding: 0.1rem 0.4rem;
		font-size: 0.75rem;
		text-decoration: none;
	}
</style>
