<script lang="ts">
	import {
		Eye,
		Info,
		Link2,
		List,
		RotateCcw,
		Shuffle,
		SquarePen,
		Undo,
	} from '@lucide/svelte'
</script>

<section aria-label="About this puzzle">
	<details>
		<summary><Info /> About this puzzle</summary>
		<p>
			<i>Slidorus</i> is a sliding puzzle made of 9 blocks of 9 pieces.
			Every row and column can be shifted in either direction; use your
			mouse on desktop or touch movements on a mobile device. When a piece
			moves off one side of the grid, it reappears on the opposite side.
			In other words, the pieces move on a
			<a href="https://en.wikipedia.org/wiki/Torus" target="_blank"
				>torus</a
			>.
		</p>
		<p>
			The puzzle is similar to 9×9
			<a href="https://loopover.xyz/" target="_blank">Loopover</a>, but
			with a Rubik's Cube-inspired color scheme and indistinguishable
			pieces within each 3×3 block. The puzzle is solved when each 3×3
			block is uniformly colored; the exact placement of the blocks does
			not matter.
		</p>

		<p>
			The rows can also be moved by using the keys <kbd>1</kbd>,
			<kbd>2</kbd>, ..., <kbd>9</kbd>, and the columns by using the keys
			<kbd>q</kbd>,
			<kbd>w</kbd>, ..., <kbd>o</kbd>. The shift key toggles the
			direction.
		</p>

		<p>
			In editing mode, several options are available to make the puzzle
			more interesting:
		</p>

		<ul class="edit-options">
			<li>Pieces can be bandaged (so they always move together).</li>
			<li>Pieces can be fixed (so they don't move anymore).</li>
			<li>Pieces can be marked as rotating.</li>
			<li>Rows and columns can be grouped with each other.</li>
		</ul>

		<p>
			A rotating piece rotates by 40 degrees for every step of a move. The
			puzzle is only solved when all rotating pieces have rotation 0.
		</p>

		<p>
			Each configuration of pieces, rows and columns leads to a different
			challenge and is reflected in the URL, which can be shared or
			bookmarked.
		</p>

		<p>
			There is a selection of preconfigured challenges, grouped by
			difficulty. Your solves for these are recorded in your browser (move
			count and date).
		</p>

		<ul class="button-explanation">
			<li>
				<span class="btn"><List /> </span> opens the list of challenges
			</li>
			<li>
				<span class="btn"><Shuffle /></span> scrambles the puzzle
			</li>
			<li>
				<span class="btn"><RotateCcw /> </span> resets the puzzle
			</li>
			<li>
				<span class="btn"><Undo /></span> undos the last move
			</li>
			<li>
				<span class="btn"><Eye /></span> shows the torus visualization
			</li>
			<li>
				<span class="btn"><SquarePen /></span> enters editing mode
			</li>
			<li>
				<span class="btn"><Link2 /></span> copies the URL
			</li>
		</ul>

		<p>
			The code for this application can be found on
			<a href="https://github.com/ScriptRaccoon/slidorus" target="_blank"
				>GitHub</a
			>. Contributions and feedback are welcome!
		</p>
	</details>
</section>

<style>
	.button-explanation {
		list-style-type: none;

		li {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			margin-bottom: 0.25rem;
		}
	}

	.edit-options {
		padding-left: 2rem;
	}
</style>
