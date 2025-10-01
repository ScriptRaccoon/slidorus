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
	}
	if ('touches' in e && e.touches.length > 0) {
		return { x: e.touches[0].clientX, y: e.touches[0].clientY }
	}
	throw new Error('No position found')
}

export function get_changed_position(e: MouseEvent | TouchEvent): {
	x: number
	y: number
} {
	if (e instanceof MouseEvent) {
		return { x: e.clientX, y: e.clientY }
	}
	if ('changedTouches' in e && e.changedTouches.length > 0) {
		return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
	}
	throw new Error('No position found')
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}

export function sleep(delay: number): Promise<void> {
	return new Promise((res) => setTimeout(res, delay))
}
