<script lang="ts">
	import { game } from '../core/game.svelte'

	let move_history_element = $state<HTMLElement | null>(null)

	$effect(() => {
		if (game.move_count && move_history_element) {
			move_history_element.scrollTo({
				left: move_history_element.scrollWidth,
				behavior: 'smooth',
			})
		}
	})
</script>

<section
	class="move_display"
	aria-label="Moves"
	class:invisible={game.state === 'editing'}
>
	<div class="move_count" aria-live="polite">
		{game.move_count}
		{#if game.move_count === 1}
			move
		{:else}
			moves
		{/if}
	</div>
	<div class="move_history_container">
		<div class="overlay"></div>
		<ol
			class="move_history no-scrollbars"
			bind:this={move_history_element}
			aria-label="Move History"
		>
			{#each game.move_history as move_notation}
				<li class="move">{move_notation}</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.move_display {
		color: var(--secondary-font-color);
		font-size: 0.875rem;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;

		@media (max-width: 720px) {
			padding-right: 1rem;
		}

		&.invisible {
			visibility: hidden;
		}
	}

	.move_count {
		font-weight: 600;
	}

	.move_history_container {
		position: relative;
		overflow: scroll;
		text-align: right;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 3rem;
		background-image: linear-gradient(
			to right,
			var(--bg-color),
			transparent
		);
	}

	.move_history {
		padding-left: 3rem;
		font-family: monospace;
		display: block;
		list-style-type: none;
	}

	.move {
		display: inline;

		&:last-child {
			color: var(--highlight-color);
		}

		&:not(:first-child) {
			margin-left: 0.5rem;
		}
	}
</style>
