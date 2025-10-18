<script lang="ts">
	import { game } from '../core/game.svelte'
	import { type Challenge, type GameConfig } from '../core/config'
	import { Check, X } from '@lucide/svelte'
	import { CHALLENGES } from '../data/challenges'
	import { solves_storage } from '../core/solves.svelte'

	type Props = {
		open: boolean
		current_challenge: Challenge | undefined
		update_URL: (config: GameConfig) => void
	}

	let {
		open = $bindable(),
		current_challenge = $bindable(),
		update_URL,
	}: Props = $props()

	function load_challenge(challenge: Challenge) {
		game.load_from_config(challenge.config)
		update_URL(challenge.config)
		current_challenge = challenge
	}

	let dialog_element = $state<HTMLDialogElement | null>(null)

	function handle_close() {
		dialog_element?.close()
	}

	function detect_outside_click(e: MouseEvent) {
		const outside = open && !dialog_element?.contains(e.target as Node)
		if (outside) handle_close()
	}
</script>

<svelte:window onclick={detect_outside_click} />

<dialog
	bind:this={dialog_element}
	{open}
	onclose={() => (open = false)}
	id="challenge-selector"
	aria-labelledby="challenge-selector-title"
>
	<header>
		<h2 id="challenge-selector-title">Challenges</h2>
		<button class="close" aria-label="Close" onclick={handle_close}>
			<X />
		</button>
	</header>

	<div class="list" role="radiogroup" aria-label="Select a challenge">
		{#each CHALLENGES as challenge}
			<button
				class="challenge"
				role="radio"
				aria-checked={challenge.name === current_challenge?.name}
				onclick={() => load_challenge(challenge)}
				data-difficulty={challenge.difficulty}
			>
				<span>{challenge.name}</span>
				{#if solves_storage.has(challenge)}
					<Check />
				{/if}
			</button>
		{/each}
	</div>
</dialog>

<style>
	dialog {
		z-index: 10;
		border: none;
		color: var(--font-color);
		background-color: var(--secondary-bg-color);
		box-shadow: 0 0 3rem #000b;
		position: fixed;
		top: 0;
		height: 75vh;
		left: auto;
		right: 0;
		overflow-y: scroll;
		border-bottom-left-radius: 0.5rem;
	}

	@media (prefers-reduced-motion: no-preference) {
		dialog {
			--speed: 180ms;
			transition:
				display var(--speed) allow-discrete,
				overlay var(--speed) allow-discrete;

			animation: close var(--speed) forwards ease-in;

			&[open] {
				animation: open var(--speed) forwards ease-out;
			}
		}
	}

	@keyframes open {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes close {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(100%);
		}
	}

	.list {
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
		&[aria-checked='true'] {
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

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-block: 1rem;
		padding-inline: 1rem;
	}

	h2 {
		font-weight: 500;
		font-size: 1rem;
	}

	button.close {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		width: 1.5rem;
		aspect-ratio: 1;
	}
</style>
