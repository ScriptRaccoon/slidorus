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
	}
</style>
