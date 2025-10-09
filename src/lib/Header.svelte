<script lang="ts">
	import { List } from '@lucide/svelte'
	import { game } from '../core/game.svelte'

	type Props = {
		challenge_name: string
		open_challenge_selector: () => void
	}

	let { challenge_name, open_challenge_selector }: Props = $props()
</script>

<header>
	<h1>Slidorus</h1>
	<div class="subtitle">
		<h2>{challenge_name}</h2>
		<button
			class="btn small"
			disabled={game.state !== 'idle'}
			onclick={(e) => {
				e.stopPropagation()
				open_challenge_selector()
			}}
			aria-label="Open list of challenges challenge selector"
		>
			<List />
		</button>
	</div>
</header>

<style>
	header {
		padding-block: 1rem;
	}

	h1 {
		font-size: 1.75rem;
		font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
			'Lucida Sans', Arial, sans-serif;
		text-transform: uppercase;
		font-weight: 600;
		color: var(--highlight-color);
		letter-spacing: 2px;
		text-align: center;
	}

	h2 {
		font-weight: 300;
		font-size: 0.875rem;
		font-family: monospace;
	}

	.subtitle {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
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
