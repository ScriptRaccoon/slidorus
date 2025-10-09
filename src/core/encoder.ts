export class Encoder {
	static encode_subset(subset: number[]): string {
		if (!subset.length) return ''

		let bitfield = 0n

		for (const n of subset) {
			bitfield |= 1n << BigInt(n)
		}

		return bitfield.toString(36)
	}

	static decode_subset(str: string): number[] {
		if (!str) return []

		let bitfield = 0n
		const chars = str.split('')

		for (const c of chars) {
			const digit = BigInt(parseInt(c, 36))
			bitfield = bitfield * 36n + digit
		}

		const subset: number[] = []
		for (let i = 0; i <= 80; i++) {
			if ((bitfield & (1n << BigInt(i))) !== 0n) {
				subset.push(i)
			}
		}

		return subset
	}

	static encode_subsets(subsets: number[][]): string {
		return subsets.map((subset) => Encoder.encode_subset(subset)).join('-')
	}

	static decode_subsets(subsets_str: string): number[][] {
		return subsets_str.split('-').map((str) => Encoder.decode_subset(str))
	}
}
