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

// detection of movement on square
let startX = 0
let startY = 0

/**
 * @param {number} dx
 * @param {number} dy
 */
function getDirection(dx, dy) {
	if (Math.abs(dx) > Math.abs(dy)) {
		return dx > 0 ? 'right' : 'left'
	} else {
		return dy > 0 ? 'down' : 'up'
	}
}

/**
 * @param {MouseEvent | TouchEvent} e
 */
function onStart(e) {
	const touch = 'touches' in e ? e.touches[0] : e
	startX = touch.clientX
	startY = touch.clientY
}

/**
 * @param {MouseEvent | TouchEvent} e
 */
function onEnd(e) {
	const touch = 'changedTouches' in e ? e.changedTouches[0] : e
	const dx = touch.clientX - startX
	const dy = touch.clientY - startY
	if (dx === 0 && dy === 0) return

	const col = Math.floor(
		(9 * (startX - square.getBoundingClientRect().left)) / SQUARE_SIZE,
	)
	const row = Math.floor(
		(9 * (startY - square.getBoundingClientRect().top)) / SQUARE_SIZE,
	)

	const is_horizontal = Math.abs(dx) > Math.abs(dy)
	if (is_horizontal) {
		move_row(row, dx > 0 ? 1 : -1)
	} else {
		move_column(col, dy > 0 ? 1 : -1)
	}
}

square.addEventListener('mousedown', (e) => onStart(e))
square.addEventListener('mouseup', (e) => onEnd(e))

square.addEventListener('touchstart', (e) => onStart(e))
square.addEventListener('touchend', (e) => onEnd(e))
