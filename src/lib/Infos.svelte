<script lang="ts">
	import { Info } from '@lucide/svelte'
</script>

<details>
	<summary><Info /> About this puzzle</summary>
	<p>
		<i>Slidorus</i> is a sliding puzzle made of 9 blocks, each containing 9 pieces,
		arranged in a 9×9 grid. Every row and column can be shifted in either direction;
		use your mouse on desktop or touch movements on a mobile device. When a piece
		moves off one side of the grid, it reappears on the opposite side. In other words,
		the pieces move on a
		<a href="https://en.wikipedia.org/wiki/Torus" target="_blank">torus</a>.
	</p>
	<p>
		The puzzle is similar to 9×9
		<a href="https://loopover.xyz/" target="_blank">Loopover</a>, but with a Rubik's
		Cube-inspired color scheme and indistinguishable pieces within each 3×3 block. The
		puzzle is solved when each 3×3 block is uniformly colored; the exact placement of
		the blocks does not matter.
	</p>

	<p>
		An additional option lets you "bandage" pieces together. This makes the puzzle
		significantly more complex, especially when many pieces are bandaged. Furthermore,
		it is possible to make pieces fixed, so that they will not move anymore. This adds
		yet another level of complexity. The configuration can be shared by using the
		"Share" button.
	</p>

	<p>
		The code for this application can be found on
		<a href="https://github.com/ScriptRaccoon/slidorus" target="_blank">GitHub</a>.
		Contributions and feedback are welcome.
	</p>
</details>

<style>
	summary {
		width: max-content;
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;

		&:focus-visible {
			outline: 1px solid var(--outline-color);
			outline-offset: 2px;
		}
	}

	details[open] summary {
		color: var(--highlight-color);
	}
</style>
