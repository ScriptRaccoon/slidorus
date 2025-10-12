export function throttle<T extends any[]>(
	fn: (...args: T) => void,
	delay: number,
) {
	let last = 0
	return (...args: T) => {
		const now = Date.now()
		if (now - last >= delay) {
			last = now
			fn(...args)
		}
	}
}

export function get_position(e: MouseEvent | TouchEvent): {
	x: number
	y: number
} {
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
		return {
			x: e.changedTouches[0].clientX,
			y: e.changedTouches[0].clientY,
		}
	}
	throw new Error('No position found')
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}

export function sleep(delay: number): Promise<void> {
	return new Promise((res) => setTimeout(res, delay))
}

export function update_URL_param(
	url: URL,
	key: string,
	val: string | null | undefined,
) {
	if (val) {
		url.searchParams.set(key, val)
	} else {
		url.searchParams.delete(key)
	}
}

export function equal_objects(obj1: any, obj2: any) {
	for (const key in obj1) {
		if (obj1[key] !== obj2[key]) return false
	}

	for (const key in obj2) {
		if (obj1[key] !== obj2[key]) return false
	}

	return true
}

export function mod(x: number, n: number) {
	return ((x % n) + n) % n
}
