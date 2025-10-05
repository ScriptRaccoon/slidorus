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

/**
 * Encode an array of disjoint subsets of {0..8} into a compact base-36 string.
 * Each subset is represented as a 9-bit mask (0–511) and stored as 2 base-36 characters.
 *
 * Examples:
 *   [] → ""
 *   [[4,5]] → "1c"
 *   [[1,3],[7,8,2]] → "0acc"
 */
export function encode_sets(sets: number[][]): string {
	return sets
		.map((subset) => {
			let mask = 0
			for (const n of subset) {
				if (n < 0 || n > 8) throw new Error('Element out of range 0...8')
				mask |= 1 << n
			}
			return mask.toString(36).padStart(2, '0')
		})
		.join('')
}

/**
 * Decode a string produced by {@link encode_sets} back into an array of subsets.
 */
export function decode_sets(encoded: string): number[][] {
	if (encoded.length % 2 !== 0) throw new Error('Invalid encoding length')

	const sets: number[][] = []

	for (let i = 0; i < encoded.length; i += 2) {
		const chunk = encoded.slice(i, i + 2)
		const mask = parseInt(chunk, 36)
		if (Number.isNaN(mask)) throw new Error(`Invalid base-36 chunk: ${chunk}`)

		const subset: number[] = []

		for (let bit = 0; bit < 9; bit++) {
			if (mask & (1 << bit)) subset.push(bit)
		}

		sets.push(subset)
	}

	return sets
}

export function update_URL_param(url: URL, key: string, val: string) {
	if (val) {
		url.searchParams.set(key, val)
	} else {
		url.searchParams.delete(key)
	}
}
