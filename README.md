# Slidorus

[👉 Play here](https://slidorus.xyz)

## About this puzzle

Slidorus is a sliding puzzle made of 9 blocks of 9 pieces. Every row and column can be shifted in either direction. When a piece moves off one side of the grid, it reappears on the opposite side. In other words, the pieces move on a [torus](https://en.wikipedia.org/wiki/Torus).

<img alt="scrambled state" src="https://github.com/user-attachments/assets/cd409e14-e994-4af4-81e9-b034bb7b056a" />

The puzzle is similar to 9×9 [Loopover](https://loopover.xyz/), but with a Rubik's Cube-inspired color scheme and indistinguishable pieces within each 3×3 block. The puzzle is solved when each 3×3 block is uniformly colored; the exact placement of the blocks does not matter.

<img alt="solved state" src="https://github.com/user-attachments/assets/e1bb22dc-eed1-44b0-8663-4611f6cac4e9" />

The rows can also be moved by using the keys `1`, `2`, ..., `9`, and the columns by using the keys `q`, `w`, ..., `o`. The shift key toggles the direction.

In editing mode, several options are available to make the puzzle more interesting:

-   Pieces can be bandaged (so they always move together).
-   Pieces can be fixed (so they don't move anymore).
-   Pieces can be marked as rotating.
-   Rows and columns can be grouped with each other.

<img width="300" alt="bandaged puzzle" src="https://github.com/user-attachments/assets/2dc5b460-2b95-4624-8c12-65956288e4b4" /> <img width="300" alt="bandaged puzzle, scrambled" src="https://github.com/user-attachments/assets/b63de29b-7ef9-40aa-b395-c758654d141c" />

A rotating piece rotates by 40 degrees for every step of a move. The puzzle is only solved when all rotating pieces have no rotation left.

Each configuration of pieces, rows and columns leads to a different challenge and is reflected in the URL, which can be shared or bookmarked. There is a selection of preconfigured challenges, grouped by difficulty.
 
<img alt="challenge selector" src="https://github.com/user-attachments/assets/cdf4f99d-d102-4c33-b152-a9d56ae9b6a1" />

Your solves for these challenges are recorded in your browser (move count and date), as well as the progress for every game.
 
<img alt="list of solves" src="https://github.com/user-attachments/assets/72c0a15f-7998-41d0-86f4-dc6926dcfc9d" />
  
The app works on both desktop and mobile. Contributions and feedback are welcome!

## Implementation Details

This application is built with [Svelte 5](https://svelte.dev) and [TypeScript](https://www.typescriptlang.org/). Apart from the icon library [lucide/svelte](https://lucide.dev/guide/packages/lucide-svelte), no external libraries are used.

The 3D torus visualization is implemented entirely in standard CSS, inspired by the work of [Amit Sheen](https://github.com/Amit-Sheen). A standalone example is available on [CodePen](https://codepen.io/scriptraccoon/pen/LEGGrzp).
