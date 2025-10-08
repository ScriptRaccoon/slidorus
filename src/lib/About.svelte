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

<details>
	<summary><Info /> About this puzzle</summary>
	<p>
		<i>Slidorus</i> is a sliding puzzle made of 9 blocks of 9 pieces. Every
		row and column can be shifted in either direction; use your mouse on
		desktop or touch movements on a mobile device. When a piece moves off
		one side of the grid, it reappears on the opposite side. In other words,
		the pieces move on a
		<a href="https://en.wikipedia.org/wiki/Torus" target="_blank">torus</a>.
	</p>
	<p>
		The puzzle is similar to 9×9
		<a href="https://loopover.xyz/" target="_blank">Loopover</a>, but with a
		Rubik's Cube-inspired color scheme and indistinguishable pieces within
		each 3×3 block. The puzzle is solved when each 3×3 block is uniformly
		colored; the exact placement of the blocks does not matter.
	</p>

	<ul>
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
		In editing mode, pieces can be bandaged together. This makes the puzzle
		significantly more complex, especially when many pieces are bandaged.
		Furthermore, it is possible to make pieces fixed, so that they will not
		move anymore. This adds yet another level of complexity. Finally, rows
		and columns can be grouped, meaning they always move together. The
		configuration can be shared by using the "Share" button.
	</p>

	<p>
		The rows can also be moved by using the keys 1,2,...,9, and the columns
		by using the keys q,w,...,o. The shift key toggles the direction.
	</p>

	<p>
		The code for this application can be found on
		<a href="https://github.com/ScriptRaccoon/slidorus" target="_blank"
			>GitHub</a
		>. Contributions and feedback are welcome!
	</p>
</details>

<style>
	ul {
		list-style-type: none;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}
</style>
