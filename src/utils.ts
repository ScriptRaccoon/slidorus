/**
 * Throttles a function
 */
export function throttle<T>(fn: (a: T) => void, delay: number) {
	let last = 0
	// @ts-ignore
	return (arg: T) => {
		const now = Date.now()
		if (now - last >= delay) {
			last = now
			fn(arg)
		}
	}
}
