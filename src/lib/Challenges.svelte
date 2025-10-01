<script lang="ts">
	import { Trophy } from '@lucide/svelte'
	import challenges from '../data/challenges.json'

	const base_url = window.location.origin
</script>

<details>
	<summary>
		<Trophy /> Challenges
	</summary>

	<ol>
		{#each challenges as challenge}
			<li>
				<a href="{base_url}?config={challenge.config}">{challenge.name}</a>
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

	a {
		display: inline-block;
		outline: 0.1rem solid var(--dark-outline-color);
		border-radius: 0.25rem;
		padding: 0.1rem 0.4rem;
		font-size: 0.75rem;
		text-decoration: none;
	}
</style>
