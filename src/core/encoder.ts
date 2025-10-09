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
		for (const c of str) {
			const digit = BigInt(parseInt(c, 36))
			bitfield = bitfield * 36n + digit
		}

		const subset: number[] = []
		let index = 0
		while (bitfield !== 0n) {
			if ((bitfield & 1n) !== 0n) subset.push(index)
			bitfield >>= 1n
			index++
		}

		return subset
	}

	static encode_subsets(subsets: number[][]): string {
		return subsets
			.map((subset) => Encoder.encode_subset(subset))
			.sort()
			.join('-')
	}

	static decode_subsets(subsets_str: string): number[][] {
		return subsets_str.split('-').map((str) => Encoder.decode_subset(str))
	}
}
