export function throttle<T extends any[]>(fn: (...args: T) => void, delay: number) {
	let last = 0
	return (...args: T) => {
		const now = Date.now()
		if (now - last >= delay) {
			last = now
			fn(...args)
		}
	}
}

export function get_position(e: MouseEvent | TouchEvent): { x: number; y: number } {
	if (e instanceof MouseEvent) {
		return { x: e.clientX, y: e.clientY }
	} else if (e.touches.length > 0) {
		return { x: e.touches[0].clientX, y: e.touches[0].clientY }
	}
	throw new Error('No position found')
}

export function get_changed_position(e: MouseEvent | TouchEvent): {
	x: number
	y: number
} {
	if (e instanceof TouchEvent && e.changedTouches.length > 0) {
		return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
	} else if (e instanceof MouseEvent) {
		return { x: e.clientX, y: e.clientY }
	}
	throw new Error('No position found')
}
