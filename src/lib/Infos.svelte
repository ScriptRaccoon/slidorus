<details class="infos">
	<summary>About this puzzle</summary>
	<p>
		<i>Slidorus</i> is a sliding puzzle made up of 9 blocks, each containing 9 pieces,
		arranged in a Sudoku-like 9×9 grid. Every row and column can be shifted in both
		directions; use your mouse on desktop or your fingers on a phone. When a piece
		moves out of the puzzle on one side, it reappears on the opposite side. In other
		words, the pieces move on a
		<a href="https://en.wikipedia.org/wiki/Torus" target="_blank">torus</a>.
	</p>
	<p>
		The puzzle is similar to 9×9
		<a href="https://loopover.xyz/" target="_blank">Loopover</a>, but with a different
		color scheme and indistinguishable pieces within each 3×3 block. The puzzle is
		considered solved when each 3×3 block is uniformly colored; the exact positions of
		the blocks do not matter.
	</p>
</details>

<style>
	details {
		padding-inline: 1rem;
		margin-top: 2rem;
	}

	summary {
		width: max-content;
		cursor: pointer;

		&:focus-visible {
			outline: 1px solid var(--outline-color);
			outline-offset: 2px;
		}
	}

	details[open] summary {
		color: var(--highlight-color);
	}
</style>
