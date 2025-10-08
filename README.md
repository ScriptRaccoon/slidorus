# Slidorus

[👉 Play here](https://slidorus.xyz)

## About this puzzle

Slidorus is a sliding puzzle made of 9 blocks of 9 pieces. Every row and column can be shifted in either direction. When a piece moves off one side of the grid, it reappears on the opposite side. In other words, the pieces move on a [torus](https://en.wikipedia.org/wiki/Torus).

![screenshot](/public/screenshot-scrambled.png)

The puzzle is similar to 9×9 [Loopover](https://loopover.xyz/), but with a Rubik's Cube-inspired color scheme and indistinguishable pieces within each 3×3 block. The puzzle is solved when each 3×3 block is uniformly colored; the exact placement of the blocks does not matter.

![screenshot](/public/screenshot-solved.png)

In editing mode, several options are available to make the puzzle more interesting:

-   Pieces can be bandaged (so they always move together).
-   Pieces can be fixed (so they don't move anymore).
-   Rows and columns can be grouped with each other.

<img src="/public/screenshot-bandaged.png" width="300" /> <img src="/public/screenshot-bandaged-scrambled.png" width="300" />

Each configuration of pieces, rows and columns leads to a different
challenge and is reflected in the URL, which can be shared or
bookmarked.

There is a selection of preconfigured challenges, sorted by difficulty.
Your solves for these are recorded in your browser (move count and
date).

The app works on both desktop and mobile. Contributions and feedback are welcome!

## Implementation Details

This application is built with [Svelte 5](https://svelte.dev) and [TypeScript](https://www.typescriptlang.org/). Apart from the icon library [lucide/svelte](https://lucide.dev/guide/packages/lucide-svelte), no external libraries are used.

The 3D torus visualization is implemented entirely in standard CSS, inspired by the work of [Amit Sheen](https://github.com/Amit-Sheen). A standalone example is available on [CodePen](https://codepen.io/scriptraccoon/pen/LEGGrzp).
