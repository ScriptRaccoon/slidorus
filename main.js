// @ts-check

const square = /** @type {HTMLDivElement} */ (document.querySelector('.square'))
const viz_btn = /** @type {HTMLButtonElement} */ (document.querySelector('#viz_btn'))
const pieces = /** @type {HTMLDivElement[]} */ ([])

let square_size = 0
const MAX_WIDTH = 600

init()

/**
 * Initializes the application
 */
function init() {
	setup_square()
	window.addEventListener('resize', () => setup_square())
	setup_pieces()
	setup_dragging()
	setup_menu()
	create_torus()
	update_tile_colors()
}

/**
 * Sets up the size of the square
 */
function setup_square() {
	const padding = 16
	square_size = Math.min(window.innerWidth, MAX_WIDTH) - 2 * padding
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
 * Utility to set / update the offset of a piece
 * @param {HTMLDivElement} piece
 * @param {number} dx
 * @param {number} dy
 */
function set_offset(piece, dx, dy) {
	piece.style.setProperty('--dx', dx.toString())
	piece.style.setProperty('--dy', dy.toString())
}

/**
 * Utility to retrieve the coordinates of a piece
 * @param {HTMLDivElement} piece
 * @return {[number,number]}
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
	/**
	 * TODO: refactor me
	 */
	let initial_pos = /** @type {null | [number, number]} */ (null)
	let move_direction = /** @type {"horizontal" | "vertical" | null} */ (null)
	let dragged_row = /** @type {null | number} */ (null)
	let dragged_col = /** @type {null | number} */ (null)
	let moving_pieces = /** @type {HTMLDivElement[]} */ ([])

	square.addEventListener('mousedown', handle_mouse_down)
	square.addEventListener('touchstart', handle_mouse_down, { passive: true })

	square.addEventListener('mousemove', detect_direction)
	square.addEventListener('touchmove', detect_direction, { passive: true })

	square.addEventListener(
		'mousemove',
		throttle((/** @type {MouseEvent} */ e) => handle_mouse_move(e), 1000 / 60),
	)

	square.addEventListener(
		'touchmove',
		throttle((/** @type {TouchEvent} */ e) => handle_mouse_move(e), 1000 / 60),
		{ passive: true },
	)

	square.addEventListener('mouseup', handle_mouse_up)
	square.addEventListener('touchend', handle_mouse_up)

	square.addEventListener('mouseleave', handle_mouse_up)

	/**
	 * @param {MouseEvent | TouchEvent} e
	 */
	function handle_mouse_down(e) {
		/**
		 * TODO: refactor me
		 */
		e.preventDefault()
		const square_rect = square.getBoundingClientRect()
		const touch = 'touches' in e ? e.touches[0] : e
		initial_pos = [touch.clientX, touch.clientY]
		move_direction = null
		dragged_row = Math.floor((touch.clientY - square_rect.top) * (9 / square_size))
		dragged_col = Math.floor((touch.clientX - square_rect.left) * (9 / square_size))
		moving_pieces = []

		for (let i = 0; i < 9; i++) {
			const piece_in_row = pieces.find(
				(piece) =>
					get_coordinates(piece).toString() === [i, dragged_row].toString(),
			)
			if (!piece_in_row) return

			copy_piece(piece_in_row, i + 9, dragged_row)
			copy_piece(piece_in_row, i + 2 * 9, dragged_row)
			copy_piece(piece_in_row, i - 9, dragged_row)
			copy_piece(piece_in_row, i - 2 * 9, dragged_row)

			const piece_in_col = pieces.find(
				(piece) =>
					get_coordinates(piece).toString() === [dragged_col, i].toString(),
			)
			if (!piece_in_col) return

			copy_piece(piece_in_col, dragged_col, i + 9)
			copy_piece(piece_in_col, dragged_col, i + 2 * 9)
			copy_piece(piece_in_col, dragged_col, i - 9)
			copy_piece(piece_in_col, dragged_col, i - 2 * 9)
		}
	}

	/**
	 * @param {MouseEvent | TouchEvent} e
	 */
	function detect_direction(e) {
		e.preventDefault()
		const touch = 'touches' in e ? e.touches[0] : e

		if (!initial_pos) return
		if (move_direction) return

		const current_pos = [touch.clientX, touch.clientY]

		const dx = current_pos[0] - initial_pos[0]
		const dy = current_pos[1] - initial_pos[1]

		const too_early = Math.abs(dx) + Math.abs(dy) < 10

		if (too_early) return

		move_direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'

		moving_pieces =
			move_direction === 'horizontal'
				? pieces.filter((piece) => get_coordinates(piece)[1] === dragged_row)
				: pieces.filter((piece) => get_coordinates(piece)[0] === dragged_col)
	}

	/**
	 * @param {MouseEvent | TouchEvent} e
	 */
	function handle_mouse_move(e) {
		e.preventDefault()
		const touch = 'touches' in e ? e.touches[0] : e

		if (!initial_pos || !move_direction) return

		const current_pos = [touch.clientX, touch.clientY]

		const dx = current_pos[0] - initial_pos[0]
		const dy = current_pos[1] - initial_pos[1]

		for (const piece of moving_pieces) {
			if (move_direction === 'horizontal') {
				set_offset(piece, dx, 0)
			} else {
				set_offset(piece, 0, dy)
			}
		}
	}

	/**
	 * @param {MouseEvent | TouchEvent} e
	 */
	function handle_mouse_up(e) {
		e.preventDefault()
		const touch = 'changedTouches' in e ? e.changedTouches[0] : e

		if (!initial_pos) return

		const current_pos = [touch.clientX, touch.clientY]

		const dx = current_pos[0] - initial_pos[0]
		const dy = current_pos[1] - initial_pos[1]

		const dx_int = Math.round(dx * (9 / square_size))
		const dy_int = Math.round(dy * (9 / square_size))

		for (const piece of moving_pieces) {
			const [x, y] = get_coordinates(piece)
			if (move_direction === 'horizontal') {
				set_coordinate(piece, x + dx_int, y)
			} else {
				set_coordinate(piece, x, y + dy_int)
			}
			set_offset(piece, 0, 0)
		}

		const pieces_outside = pieces.filter((piece) => {
			const [x, y] = get_coordinates(piece)
			return x < 0 || x >= 9 || y < 0 || y >= 9
		})

		for (const piece of pieces_outside) {
			piece.remove()
			remove_element(pieces, piece)
		}

		initial_pos = null
		move_direction = null
		dragged_row = null
		dragged_col = null
		moving_pieces = []
		update_tile_colors()
	}
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
	pieces.push(new_piece)
	return new_piece
}

/**
 * Sets up the event listeners for the buttons in the menu
 */
function setup_menu() {
	const scramble_btn = document.querySelector('#scramble_btn')
	scramble_btn?.addEventListener('click', scramble)

	const reset_btn = document.querySelector('#reset_btn')
	reset_btn?.addEventListener('click', reset)

	viz_btn?.addEventListener('click', toggle_visualization)
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

	update_tile_colors()
}

/**
 * Resets the positions of all pieces.
 */
function reset() {
	for (const piece of pieces) {
		const original_x = Number(piece.getAttribute('data-original-x'))
		const original_y = Number(piece.getAttribute('data-original-y'))
		set_coordinate(piece, original_x, original_y)
		set_offset(piece, 0, 0)
		update_tile_colors()
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
 * Creates the 3d torus and its tiles
 */
function create_torus() {
	const scene = document.querySelector('.scene')
	if (!scene) return
	const torus = document.createElement('div')
	torus.className = 'torus'
	for (let i = 0; i < 9; i++) {
		const slice = document.createElement('div')
		slice.className = 'slice'
		slice.style.setProperty('--num', i.toString())
		for (let j = 0; j < 9; j++) {
			const tile = document.createElement('div')
			tile.className = 'tile'
			tile.style.setProperty('--index', j.toString())
			slice.appendChild(tile)
		}
		torus.appendChild(slice)
	}
	scene.appendChild(torus)
}

/**
 * Sets the tile colors from the torus to the current piece colors
 */
function update_tile_colors() {
	const torus = document.querySelector('.torus')
	if (!torus) return
	for (const piece of pieces) {
		const [x, y] = get_coordinates(piece)
		const piece_type = piece.getAttribute('data-type')
		const slice = torus.children[y]
		if (!slice) return
		const tile = slice.children[x]
		if (!tile) return
		tile.setAttribute('data-type', piece_type ?? '')
	}
}

function toggle_visualization() {
	const scene = document.querySelector('.scene')
	if (!scene) return
	if (scene.classList.contains('visible')) {
		scene.classList.remove('visible')
		viz_btn.innerText = 'View Torus'
	} else {
		scene.classList.add('visible')
		viz_btn.innerText = 'Hide Torus'
	}
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
 * Utility to remove an element from a list without reassigning it
 * @param {any[]} list
 * @param {any} el
 */
function remove_element(list, el) {
	const i = list.indexOf(el)
	list.splice(i, 1)
}

/**
 * @param {Function} fn
 * @param {number} delay
 */
function throttle(fn, delay) {
	let last = 0
	// @ts-ignore
	return (...args) => {
		const now = Date.now()
		if (now - last >= delay) {
			last = now
			fn(...args)
		}
	}
}
