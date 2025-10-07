<script lang="ts">
	import { Trophy } from '@lucide/svelte'
	import challenges from '../data/challenges.json'
	import { game } from '../core/game.svelte'
	import { update_URL, type Challenge } from '../core/challenge.svelte'

	let details_element = $state<HTMLElement | null>(null)
	let open = $state(false)

	$effect(() => {
		if (!details_element) return
		if (open) details_element.scrollIntoView({ block: 'start' })
	})

	function load_challenge(challenge: Challenge) {
		game.set_challenge(challenge)
		update_URL(challenge.config)
		window.scrollTo({ top: 0 })
	}
</script>

<details bind:this={details_element} bind:open>
	<summary>
		<Trophy /> Challenges
	</summary>

	<div>
		{#each challenges as challenge (challenge.name)}
			<button
				class:selected={game.challenge?.name === challenge.name}
				data-difficulty={challenge.difficulty}
				onclick={() => {
					load_challenge(challenge)
				}}
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
		background-color: var(--color);
		white-space: nowrap;

		&:not(:hover, :focus-visible) {
			outline: 1px solid var(--dark-outline-color);
		}

		&[data-difficulty='1'] {
			--color: var(--difficulty-color-1);
		}

		&[data-difficulty='2'] {
			--color: var(--difficulty-color-2);
		}

		&[data-difficulty='3'] {
			--color: var(--difficulty-color-3);
		}

		&[data-difficulty='4'] {
			--color: var(--difficulty-color-4);
		}

		&[data-difficulty='5'] {
			--color: var(--difficulty-color-5);
		}

		&.selected {
			outline: 1px solid var(--font-color);
		}
	}
</style>
