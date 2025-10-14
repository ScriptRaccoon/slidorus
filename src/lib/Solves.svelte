<script lang="ts">
	import { ListCheck } from '@lucide/svelte'
	import { solves_storage } from '../core/solves.svelte'
</script>

{#if solves_storage.solves.length > 0}
	<details>
		<summary>
			<ListCheck /> Your solves
		</summary>

		<table>
			<thead>
				<tr>
					<th>Challenge</th>
					<th>Moves</th>
					<th>Date</th>
				</tr>
			</thead>
			<tbody>
				{#each [...solves_storage.solves].reverse() as solve}
					<tr>
						<td>
							{solve.challenge_name}
						</td>
						<td>
							{solve.moves}
						</td>
						<td>
							{new Date(solve.date).toLocaleDateString('en-CA')}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</details>
{/if}

<style>
	table {
		margin-top: 1rem;
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
</style>
