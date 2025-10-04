<script lang="ts">
	import { Trophy } from '@lucide/svelte'
	import challenges from '../data/challenges.json'

	type Props = {
		load_challenge: (
			pieces_config: string,
			rows_config: string,
			cols_config: string,
		) => void
	}

	let { load_challenge }: Props = $props()
</script>

<details>
	<summary>
		<Trophy /> Challenges
	</summary>

	<div>
		{#each challenges as challenge}
			<button
				onclick={() =>
					load_challenge(challenge.pieces, challenge.rows, challenge.cols)}
			>
				{challenge.name}
			</button>
		{/each}
	</div>
</details>

<style>
	div {
		margin-top: 1rem;
		list-style-type: none;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: 0.6rem;
	}

	button {
		font-family: monospace;
		text-transform: uppercase;
		border-radius: 0.25rem;
		padding-block: 0.2rem;
		font-size: 0.75rem;
		background-color: var(--challenge-color);
		white-space: nowrap;

		&:not(:hover, :focus-visible) {
			outline: 1px solid var(--dark-outline-color);
		}
	}
</style>
