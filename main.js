// @ts-check

const SQUARE_SIZE = 540

const square = /** @type {HTMLDivElement} */ (document.querySelector('.square'))

square.style.setProperty('--size', `${SQUARE_SIZE}px`)

const pieces = []

for (let row = 0; row < 3; row++) {
	for (let col = 0; col < 3; col++) {
		const piece_type = 3 * row + col
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				const piece_x = 3 * col + x
				const piece_y = 3 * row + y
				const piece = document.createElement('div')
				piece.classList.add('piece', `piece-${piece_type}`)
				piece.style.setProperty('--x', piece_x.toString())
				piece.style.setProperty('--y', piece_y.toString())
				square.appendChild(piece)
				pieces.push({ element: piece, x: piece_x, y: piece_y })
			}
		}
	}
}

/**
 * @param {number} y
 * @param {number} direction
 */
function move_row(y, direction) {
	const moving_pieces = pieces.filter((piece) => piece.y == y)
	for (const piece of moving_pieces) {
		if (direction === 1) {
			piece.x = piece.x + 1 < 9 ? piece.x + 1 : 0
		} else {
			piece.x = piece.x - 1 >= 0 ? piece.x - 1 : 8
		}
		piece.element.style.setProperty('--x', piece.x.toString())
	}
}

/**
 * @param {number} x
 * @param {number} direction
 */
function move_column(x, direction) {
	const moving_pieces = pieces.filter((piece) => piece.x == x)
	for (const piece of moving_pieces) {
		if (direction === 1) {
			piece.y = piece.y + 1 < 9 ? piece.y + 1 : 0
		} else {
			piece.y = piece.y - 1 >= 0 ? piece.y - 1 : 8
		}
		piece.element.style.setProperty('--y', piece.y.toString())
	}
}

// temporary code
const mover = /** @type {HTMLButtonElement} */ (document.querySelector('.mover'))
mover.addEventListener('click', () => {
	move_column(2, 1)
})
