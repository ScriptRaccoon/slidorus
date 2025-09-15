// @ts-check

const square = /** @type {HTMLDivElement} */ (document.querySelector('.square'))
const wrapper = /** @type {HTMLDivElement} */ (document.querySelector('.wrapper'))
const status_div = /** @type {HTMLDivElement} */ (document.querySelector('#status'))
const square_rect = square.getBoundingClientRect()
const MOVE_DURATION = 100
let is_moving = false

let hovered_piece = /** @type {HTMLDivElement | null} */ (null)

const pieces = /** @type {HTMLDivElement[]} */ ([])
let clicked_pos = [0, 0]
let square_size = 0

init()

/**
 * Initializes the application
 */
function init() {
	setup_square()
	window.addEventListener('resize', () => setup_square())
	setup_pieces()
	setup_dragging()
	setup_arrow_keys()
	setup_menu()
}

/**
 * Sets up the size of the square
 */
function setup_square() {
	const wrapper_padding = 10
	square_size = wrapper.clientWidth - 2 * wrapper_padding
	square.style.setProperty('--size', `${square_size}px`)
}

/**
 * Creates all pieces and sets them up
 */
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
					piece.setAttribute('data-type', piece_type.toString())
					piece.setAttribute('data-original-x', piece_x.toString())
					piece.setAttribute('data-original-y', piece_y.toString())
					set_coordinate(piece, piece_x, piece_y)
					square.appendChild(piece)
					pieces.push(piece)
				}
			}
		}
	}
}

/**
 * Utility to set / update the coordinates of a piece
 * @param {HTMLDivElement} piece
 * @param {number} x
 * @param {number} y
 */
function set_coordinate(piece, x, y) {
	piece.style.setProperty('--x', x.toString())
	piece.style.setProperty('--y', y.toString())
}

/**
 * Utility to retrieve the coordinates of a piece
 * @param {HTMLDivElement} piece
 */
function get_coordinates(piece) {
	return [
		Number(piece.style.getPropertyValue('--x')),
		Number(piece.style.getPropertyValue('--y')),
	]
}

/**
 * Sets up the event listeners for dragging the rows / columns
 */
function setup_dragging() {
	square.addEventListener('mousedown', (e) => handle_drag_start(e))
	square.addEventListener('mouseup', (e) => handle_drag_end(e))

	square.addEventListener('touchstart', (e) => handle_drag_start(e))
	square.addEventListener('touchend', (e) => handle_drag_end(e))
}

/**
 * Handles the start of the dragging
 * @param {MouseEvent | TouchEvent} e
 */
function handle_drag_start(e) {
	const touch = 'touches' in e ? e.touches[0] : e
	clicked_pos = [touch.clientX, touch.clientY]
}

/**
 * Handles the end of the dragging that triggers the row / column animation
 * @param {MouseEvent | TouchEvent} e
 */
function handle_drag_end(e) {
	const touch = 'changedTouches' in e ? e.changedTouches[0] : e
	const dx = touch.clientX - clicked_pos[0]
	const dy = touch.clientY - clicked_pos[1]

	if (dx === 0 && dy === 0) return

	const col = Math.floor((9 * (clicked_pos[0] - square_rect.left)) / square_size)
	const row = Math.floor((9 * (clicked_pos[1] - square_rect.top)) / square_size)

	const is_horizontal = Math.abs(dx) > Math.abs(dy)

	if (is_horizontal) {
		animate_line(row, dx > 0 ? 1 : -1, 'row')
	} else {
		animate_line(col, dy > 0 ? 1 : -1, 'col')
	}
}

/**
 * Moves and animates a line (row or column)
 * @param {number} index
 * @param {1 | -1} direction
 * @param {"row" | "col"} type
 */
function animate_line(index, direction, type) {
	if (is_moving) return
	is_moving = true

	const moving_pieces = pieces.filter(
		(piece) => get_coordinates(piece)[type === 'col' ? 0 : 1] === index,
	)

	const last_piece = moving_pieces.find(
		(piece) =>
			get_coordinates(piece)[type === 'col' ? 1 : 0] === (direction === 1 ? 8 : 0),
	)

	if (!last_piece) return

	const new_piece =
		type === 'col'
			? copy_piece(last_piece, index, direction === 1 ? -1 : 9)
			: copy_piece(last_piece, direction === 1 ? -1 : 9, index)

	moving_pieces.push(new_piece)

	setTimeout(() => {
		if (type === 'col') {
			move_pieces(moving_pieces, 0, direction)
		} else {
			move_pieces(moving_pieces, direction, 0)
		}
	}, 0)

	setTimeout(() => {
		last_piece.remove()
		remove_element(pieces, last_piece)
		is_moving = false
		update_status()
	}, MOVE_DURATION)
}

/**
 * Utility to copy a piece with the same classes and attributes
 * @param {HTMLDivElement} piece
 * @param {number} x
 * @param {number} y
 */
function copy_piece(piece, x, y) {
	const new_piece = /** @type {HTMLDivElement} */ (piece.cloneNode())
	set_coordinate(new_piece, x, y)
	square.appendChild(new_piece)
	new_piece.addEventListener('mouseover', () => {
		hovered_piece = new_piece
	})
	pieces.push(new_piece)
	return new_piece
}

/**
 * Moves a list of pieces to a new destination
 * @param {HTMLDivElement[]} moving_pieces
 * @param {number} dx
 * @param {number} dy
 */
function move_pieces(moving_pieces, dx, dy) {
	for (const piece of moving_pieces) {
		const [x, y] = get_coordinates(piece)
		set_coordinate(piece, x + dx, y + dy)
	}
}

/**
 * Sets up the arrow keys to move the rows / columns
 */
function setup_arrow_keys() {
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
		e.preventDefault()

		const [x, y] = get_coordinates(hovered_piece)
		const key = e.key

		switch (key) {
			case 'ArrowRight': {
				animate_line(y, 1, 'row')
				break
			}
			case 'ArrowLeft': {
				animate_line(y, -1, 'row')
				break
			}
			case 'ArrowDown': {
				animate_line(x, 1, 'col')
				break
			}
			case 'ArrowUp': {
				animate_line(x, -1, 'col')
				break
			}
		}
	})
}

/**
 * Sets up the event listeners for the buttons in the menu
 */
function setup_menu() {
	const scramble_btn = document.querySelector('#scramble_btn')
	scramble_btn?.addEventListener('click', scramble)

	const reset_btn = document.querySelector('#reset_btn')
	reset_btn?.addEventListener('click', reset)
}

/**
 * Scrambles all the pieces. Any perceived permutation is possible here,
 * since the pieces with the same color are not distinguishable.
 */
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

/**
 * Resets the positions of all pieces.
 */
function reset() {
	for (const piece of pieces) {
		const original_x = Number(piece.getAttribute('data-original-x'))
		const original_y = Number(piece.getAttribute('data-original-y'))
		set_coordinate(piece, original_x, original_y)
	}
}

/**
 * Checks if the puzzle is solved: the condition is that each
 * 3x3-block has just one type of pieces.
 */
function check_solved() {
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < 3; col++) {
			const block_pieces = pieces.filter((piece) =>
				check_block_containment(piece, row, col),
			)
			const piece_types = get_piece_types(block_pieces)
			if (piece_types.size > 1) return false
		}
	}
	return true
}

/**
 * Utility that checks if a piece is contained in a 3x3-block
 * @param {HTMLDivElement} piece
 * @param {number} row
 * @param {number} col
 */

function check_block_containment(piece, row, col) {
	const [x, y] = get_coordinates(piece)
	return x >= 3 * col && x < 3 * (col + 1) && y >= 3 * row && y < 3 * (row + 1)
}

/**
 * Utility that retrieves the set of types (colors) of a list of pieces
 * @param {HTMLDivElement[]} piece_list
 */
function get_piece_types(piece_list) {
	return new Set(piece_list.map((piece) => piece.getAttribute('data-type') ?? ''))
}

/**
 * Updates the status text by checking if the puzzle is solved
 */
function update_status() {
	const is_solved = check_solved()
	write_status(is_solved ? 'Solved' : '')
}

/**
 * Utility to write the status text
 * @param {string} txt
 */
function write_status(txt) {
	status_div.innerText = txt
}

/**
 * Utility to remove an element from a list without reassigning it
 * @param {any[]} list
 * @param {any} el
 */
function remove_element(list, el) {
	const i = list.indexOf(el)
	list.splice(i, 1)
}
