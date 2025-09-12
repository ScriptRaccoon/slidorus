// @ts-check

const SQUARE_SIZE = 540
const PIECE_SIZE = SQUARE_SIZE / 9

const square = /** @type {HTMLDivElement} */ (document.querySelector('.square'))

square.style.setProperty('--size', `${SQUARE_SIZE}px`)

for (let row = 0; row < 3; row++) {
	for (let col = 0; col < 3; col++) {
		const piece_type = 3 * row + col
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				const piece = document.createElement('div')
				piece.classList.add('piece', `piece-${piece_type}`)
				piece.style.setProperty('--x', (3 * col + x).toString())
				piece.style.setProperty('--y', (3 * row + y).toString())
				square.appendChild(piece)
				console.log(
					`added piece of type ${piece_type} with x = ${col + x} and y = ${
						row + y
					}`,
				)
			}
		}
	}
}
