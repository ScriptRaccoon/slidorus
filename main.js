// @ts-check

const SQUARE_SIZE = 540
const square = /** @type {HTMLDivElement} */ (document.querySelector('.square'))
const square_rect = square.getBoundingClientRect()
const pieces = /** @type {HTMLDivElement[]} */ ([])
let clicked_pos = [0, 0]

init()

function init() {
	setup_square()
	setup_pieces()
	setup_dragging()
	setup_arrow_keys()
	setup_menu()
}

function setup_square() {
	square.style.setProperty('--size', `${SQUARE_SIZE}px`)
}

function setup_pieces() {
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			const piece_type = 3 * row + col
			for (let y = 0; y < 3; y++) {
				for (let x = 0; x < 3; x++) {
					const piece_x = 3 * col + x
					const piece_y = 3 * row + y
					const piece = document.createElement('div')
					piece.classList.add('piece', `piece-${piece_type}`)
					set_coordinate(piece, piece_x, piece_y)
					square.appendChild(piece)
					pieces.push(piece)
				}
			}
		}
	}
}

/**
 * @param {HTMLDivElement} piece
 * @param {number} x
 * @param {number} y
 */
function set_coordinate(piece, x, y) {
	piece.style.setProperty('--x', x.toString())
	piece.style.setProperty('--y', y.toString())
	piece.setAttribute('data-x', x.toString())
	piece.setAttribute('data-y', y.toString())
}

/**
 * @param {HTMLDivElement} piece
 */
function get_coordinates(piece) {
	return [Number(piece.getAttribute('data-x')), Number(piece.getAttribute('data-y'))]
}

function setup_dragging() {
	square.addEventListener('mousedown', (e) => handle_drag_start(e))
	square.addEventListener('mouseup', (e) => handle_drag_end(e))

	square.addEventListener('touchstart', (e) => handle_drag_start(e))
	square.addEventListener('touchend', (e) => handle_drag_end(e))
}

/**
 * @param {MouseEvent | TouchEvent} e
 */
function handle_drag_start(e) {
	const touch = 'touches' in e ? e.touches[0] : e
	clicked_pos = [touch.clientX, touch.clientY]
}

/**
 * @param {number} row
 * @param {number} direction
 */
function move_row(row, direction) {
	for (const piece of pieces) {
		const [x, y] = get_coordinates(piece)
		if (row !== y) continue
		let [x_new, y_new] = [x, y]
		if (direction === 1) {
			x_new = x + 1 < 9 ? x + 1 : 0
		} else {
			x_new = x - 1 >= 0 ? x - 1 : 9 - 1
		}
		set_coordinate(piece, x_new, y_new)
	}
}

/**
 * @param {number} col
 * @param {number} direction
 */
function move_column(col, direction) {
	for (const piece of pieces) {
		const [x, y] = get_coordinates(piece)
		if (col !== x) continue
		let [x_new, y_new] = [x, y]
		if (direction === 1) {
			y_new = y + 1 < 9 ? y + 1 : 0
		} else {
			y_new = y - 1 >= 0 ? y - 1 : 9 - 1
		}
		set_coordinate(piece, x_new, y_new)
	}
}

/**
 * @param {MouseEvent | TouchEvent} e
 */
function handle_drag_end(e) {
	const touch = 'changedTouches' in e ? e.changedTouches[0] : e
	const dx = touch.clientX - clicked_pos[0]
	const dy = touch.clientY - clicked_pos[1]

	if (dx === 0 && dy === 0) return

	const col = Math.floor((9 * (clicked_pos[0] - square_rect.left)) / SQUARE_SIZE)
	const row = Math.floor((9 * (clicked_pos[1] - square_rect.top)) / SQUARE_SIZE)

	const is_horizontal = Math.abs(dx) > Math.abs(dy)

	if (is_horizontal) {
		move_row(row, dx > 0 ? 1 : -1)
	} else {
		move_column(col, dy > 0 ? 1 : -1)
	}
}

function setup_arrow_keys() {
	let hovered_piece = /** @type {HTMLDivElement | null} */ (null)

	pieces.forEach((piece) =>
		piece.addEventListener('mouseover', () => {
			hovered_piece = piece
		}),
	)

	square.addEventListener('mouseleave', () => {
		hovered_piece = null
	})

	document.addEventListener('keydown', (e) => {
		if (!hovered_piece) return
		const [x, y] = get_coordinates(hovered_piece)
		const key = e.key

		switch (key) {
			case 'ArrowRight': {
				move_row(y, 1)
				break
			}
			case 'ArrowLeft': {
				move_row(y, -1)
				break
			}
			case 'ArrowDown': {
				move_column(x, 1)
				break
			}
			case 'ArrowUp': {
				move_column(x, -1)
				break
			}
		}
	})
}

function setup_menu() {
	const scramble_btn = document.querySelector('#scramble_btn')
	scramble_btn?.addEventListener('click', () => scramble())
}

function scramble() {
	const free_coordinates = []
	for (let x = 0; x < 9; x++) {
		for (let y = 0; y < 9; y++) {
			free_coordinates.push([x, y])
		}
	}

	for (const piece of pieces) {
		if (!free_coordinates.length) return
		const i = Math.floor(Math.random() * free_coordinates.length)
		const [x, y] = free_coordinates[i]
		set_coordinate(piece, x, y)
		free_coordinates.splice(i, 1)
	}
}
