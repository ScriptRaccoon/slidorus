// @ts-check

const square = /** @type {HTMLDivElement} */ (document.querySelector('.square'))
const wrapper = /** @type {HTMLDivElement} */ (document.querySelector('.wrapper'))
const square_rect = square.getBoundingClientRect()
const MOVE_DURATION = 100
let is_moving = false

let hovered_piece = /** @type {HTMLDivElement | null} */ (null)

const pieces = /** @type {HTMLDivElement[]} */ ([])
let clicked_pos = [0, 0]
let square_size = 0

init()

function init() {
	setup_square()
	window.addEventListener('resize', () => setup_square())
	setup_pieces()
	setup_dragging()
	setup_arrow_keys()
	setup_menu()
}

function setup_square() {
	const wrapper_padding = 10
	square_size = wrapper.clientWidth - 2 * wrapper_padding
	square.style.setProperty('--size', `${square_size}px`)
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
 * @param {HTMLDivElement} piece
 * @param {number} x
 * @param {number} y
 */
function set_coordinate(piece, x, y) {
	piece.style.setProperty('--x', x.toString())
	piece.style.setProperty('--y', y.toString())
}

/**
 * @param {HTMLDivElement} piece
 */
function get_coordinates(piece) {
	return [
		Number(piece.style.getPropertyValue('--x')),
		Number(piece.style.getPropertyValue('--y')),
	]
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
function animate_row(row, direction) {
	if (is_moving) return
	is_moving = true
	/**
	 * TODO: refactor this mess of a function
	 */
	const moving_pieces = pieces.filter((piece) => get_coordinates(piece)[1] === row)

	const last_piece = moving_pieces.find(
		(piece) => get_coordinates(piece)[0] === (direction === 1 ? 8 : 0),
	)
	if (!last_piece) return
	const new_piece = /** @type {HTMLDivElement} */ (last_piece.cloneNode())

	set_coordinate(new_piece, direction === 1 ? -1 : 9, row)

	square.appendChild(new_piece)

	new_piece.addEventListener('mouseover', () => {
		hovered_piece = new_piece
	})

	moving_pieces.push(new_piece)
	pieces.push(new_piece)

	setTimeout(() => {
		for (const piece of moving_pieces) {
			const [x, y] = get_coordinates(piece)
			set_coordinate(piece, x + direction, y)
		}
	}, 0)

	setTimeout(() => {
		last_piece.remove()
		const i = pieces.findIndex((p) => p === last_piece)
		pieces.splice(i, 1)
		is_moving = false
	}, MOVE_DURATION)
}

/**
 * @param {number} col
 * @param {number} direction
 */
function animate_column(col, direction) {
	if (is_moving) return
	is_moving = true
	/**
	 * TODO: refactor this mess of a function
	 */
	const moving_pieces = pieces.filter((piece) => get_coordinates(piece)[0] === col)

	const last_piece = moving_pieces.find(
		(piece) => get_coordinates(piece)[1] === (direction === 1 ? 8 : 0),
	)
	if (!last_piece) return
	const new_piece = /** @type {HTMLDivElement} */ (last_piece.cloneNode())

	set_coordinate(new_piece, col, direction === 1 ? -1 : 9)

	square.appendChild(new_piece)

	new_piece.addEventListener('mouseover', () => {
		hovered_piece = new_piece
	})

	moving_pieces.push(new_piece)
	pieces.push(new_piece)

	setTimeout(() => {
		for (const piece of moving_pieces) {
			const [x, y] = get_coordinates(piece)
			set_coordinate(piece, x, y + direction)
		}
	}, 0)

	setTimeout(() => {
		last_piece.remove()
		const i = pieces.findIndex((p) => p === last_piece)
		pieces.splice(i, 1)
		is_moving = false
	}, MOVE_DURATION)
}

/**
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
		animate_row(row, dx > 0 ? 1 : -1)
	} else {
		animate_column(col, dy > 0 ? 1 : -1)
	}
}

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
				animate_row(y, 1)
				break
			}
			case 'ArrowLeft': {
				animate_row(y, -1)
				break
			}
			case 'ArrowDown': {
				animate_column(x, 1)
				break
			}
			case 'ArrowUp': {
				animate_column(x, -1)
				break
			}
		}
	})
}

function setup_menu() {
	const scramble_btn = document.querySelector('#scramble_btn')
	scramble_btn?.addEventListener('click', scramble)

	const reset_btn = document.querySelector('#reset_btn')
	reset_btn?.addEventListener('click', reset)
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

function reset() {
	for (const piece of pieces) {
		const original_x = Number(piece.getAttribute('data-original-x'))
		const original_y = Number(piece.getAttribute('data-original-y'))
		set_coordinate(piece, original_x, original_y)
	}
}
