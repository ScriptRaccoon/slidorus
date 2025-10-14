<script lang="ts">
	import { game } from '../core/game.svelte'
	import Connector from './Connector.svelte'

	let clicked_row = $state<number | null>(null)
	let clicked_col = $state<number | null>(null)

	function connect_row(row: number) {
		if (clicked_row === null) {
			clicked_row = row
			return
		}

		if (clicked_row === row) {
			clicked_row = null
			return
		}

		game.row_grouping.merge(clicked_row, row)

		clicked_row = null
	}

	function disconnect_row(row: number) {
		game.row_grouping.remove_group(row)
	}

	function connect_col(col: number) {
		if (clicked_col === null) {
			clicked_col = col
			return
		}

		if (clicked_col === col) {
			clicked_col = null
			return
		}

		game.col_grouping.merge(clicked_col, col)

		clicked_col = null
	}

	function disconnect_col(col: number) {
		game.col_grouping.remove_group(col)
	}
</script>

<div class="row_connectors">
	{#each { length: 9 } as _, row}
		<Connector
			type="row"
			index={row}
			disabled={game.state !== 'editing'}
			active={row === clicked_row}
			connect={() => connect_row(row)}
			remove={() => disconnect_row(row)}
			group={game.row_grouping.get_group_index(row)}
		/>
	{/each}
</div>

<div class="col_connectors">
	{#each { length: 9 } as _, col}
		<Connector
			type="col"
			index={col}
			disabled={game.state !== 'editing'}
			active={col === clicked_col}
			connect={() => connect_col(col)}
			remove={() => disconnect_col(col)}
			group={game.col_grouping.get_group_index(col)}
		/>
	{/each}
</div>

<style>
	.row_connectors {
		grid-row: 2;
		grid-column: 2;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		padding-left: 0.5rem;
	}

	.col_connectors {
		grid-row: 3;
		grid-column: 1;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		padding-top: 0.5rem;
	}
</style>
