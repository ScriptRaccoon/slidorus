<script lang="ts">
	import { ListCheck, Trash } from '@lucide/svelte'
	import { solves_storage } from '../core/solves.svelte'
	import { open_modal } from '../core/modal.svelte'
	import { game } from '../core/game.svelte'

	let show_best = $state(false)

	let displayed_solves = $derived(
		show_best
			? [...solves_storage.get_best_solves()].reverse()
			: [...solves_storage.solves].reverse(),
	)

	function delete_solves() {
		open_modal(
			'This will remove all recorded solves. This action cannot be undone. Are you sure?',
			() => {
				solves_storage.clear()
			},
		)
	}

	function delete_progress() {
		game.delete_progress()
	}
</script>

<section aria-label="Solves">
	<details>
		<summary>
			<ListCheck />
			{#if show_best}
				Your best solves
			{:else}
				Your solves
			{/if}
		</summary>

		{#if solves_storage.solves.length > 0}
			<table>
				<thead>
					<tr>
						<th>Challenge</th>
						<th>Moves</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{#each displayed_solves as solve}
						<tr>
							<td>
								{solve.challenge_name}
							</td>
							<td>
								{solve.moves}
							</td>
							<td>
								{new Date(solve.date).toLocaleDateString(
									'en-CA',
								)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<label>
				Show best solves per challenge
				<input type="checkbox" bind:checked={show_best} />
			</label>
		{:else}
			<p>No solves recorded yet.</p>
		{/if}

		<menu>
			{#if solves_storage.solves.length > 0}
				<button class="btn icon" onclick={delete_solves}>
					<Trash />
					Delete solves
				</button>
			{/if}

			<button class="btn icon" onclick={delete_progress}>
				<Trash /> Delete progress
			</button>
		</menu>
	</details>
</section>

<style>
	table {
		margin-block: 1rem;
		width: 100%;
		border-spacing: 0;
	}

	th {
		font-weight: 500;
		text-align: left;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	th,
	td {
		padding: 0.25rem 0.5rem;
	}

	tbody {
		font-size: 0.875rem;

		tr:nth-child(2n) {
			background-color: var(--secondary-bg-color);
		}
	}

	label {
		display: inline-flex;
		gap: 0.5rem;
		align-items: center;
	}

	menu {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
</style>
