<script lang="ts">
	import { game } from '../core/game.svelte'
	import challenges from '../data/challenges.json'
	import { update_URL, type Challenge } from '../core/challenge'
	import { Check, X } from '@lucide/svelte'
	import { get_solved_challenge_names } from '../core/solves.svelte'

	type Props = {
		open: boolean
	}

	let { open = $bindable() }: Props = $props()

	function load_challenge(challenge: Challenge) {
		game.set_challenge(challenge)
		update_URL(challenge.config)
	}

	let dialog_element = $state<HTMLDialogElement | null>(null)

	$effect(() => {
		if (open) dialog_element?.showModal()
	})

	function handle_close() {
		dialog_element?.close()
	}

	function detect_outside_click(e: MouseEvent) {
		const outside = open && !dialog_element?.contains(e.target as Node)
		if (outside) handle_close()
	}
</script>

<svelte:window onclick={detect_outside_click} />

<dialog bind:this={dialog_element} onclose={() => (open = false)}>
	<button class="close" aria-label="Close" onclick={handle_close}>
		<X />
	</button>

	<div class="list">
		{#each challenges as challenge}
			{@const is_solved = get_solved_challenge_names().includes(
				challenge.name,
			)}
			<button
				class="challenge"
				onclick={() => load_challenge(challenge)}
				data-difficulty={challenge.difficulty}
				class:selected={game.challenge?.name === challenge.name}
			>
				<span>{challenge.name}</span>
				{#if is_solved}
					<Check />
				{/if}
			</button>
		{/each}
	</div>
</dialog>

<style>
	dialog {
		border: none;
		color: var(--font-color);
		background-color: var(--bg-color);
		box-shadow: 0 0 2rem #000a;
		padding-block: 1rem;
		position: fixed;
		top: 0;
		height: 100vh;
		left: auto;
		right: 0;
		overflow-y: scroll;

		&::backdrop {
			pointer-events: none;
			background: none;
		}
	}

	.list {
		margin-top: 1rem;
		display: grid;
	}

	.challenge {
		padding: 0.25rem 1rem;
		font-family: monospace;
		border: 1px solid transparent;
		background-color: var(--color, transparent);
		outline: none;
		text-align: left;
		display: inline-flex;
		justify-content: space-between;
		gap: 1rem;

		&:hover,
		&:focus-visible,
		&.selected {
			border-color: var(--font-color);
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
	}

	button.close {
		display: flex;
		justify-content: center;
		align-items: center;
		justify-self: center;
		border-radius: 50%;
		width: 2rem;
		aspect-ratio: 1;
	}
</style>
