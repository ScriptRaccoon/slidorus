import { Piece } from './piece.svelte'

export class Encoder {
	/**
	 * Encodes a list of pieces into a compact base-36 string.
	 *
	 * Format per piece: 3 characters
	 * - **Coordinate (2 chars):** Each piece is located on a 9×9 grid (0–80).
	 *   The coordinate is computed as y*9 + x and encoded in base-36,
	 *   padded to 2 characters.
	 * - **Flags (1 char):** Bandaging state encoded in 5 bits:
	 *   fixed (bit 4), up (bit 3), right (bit 2), down (bit 1), left (bit 0).
	 *   This yields 0–31, stored as a single base-36 character.
	 *
	 * The final string is the concatenation of all encoded pieces.
	 *
	 * Example:
	 *   Piece at (x=6, y=5), bandaged right:
	 *   - Coordinate = 5*9 + 6 = 51 → "1f" (base-36, padded to 2 chars).
	 *   - Flags = 00100₂ = 4 → "4" (base-36).
	 *   - Encoded = "1f4".
	 */
	static encode_pieces(pieces: Piece[]): string {
		return pieces
			.filter(
				(piece) =>
					piece.fixed ||
					piece.bandaged_up ||
					piece.bandaged_right ||
					piece.bandaged_down ||
					piece.bandaged_left,
			)
			.map((piece) => {
				const coord = piece.original_y * 9 + piece.original_x
				const flags =
					(Number(piece.fixed) << 4) |
					(Number(piece.bandaged_up) << 3) |
					(Number(piece.bandaged_right) << 2) |
					(Number(piece.bandaged_down) << 1) |
					Number(piece.bandaged_left)

				const coord_str = coord.toString(36).padStart(2, '0')
				const flags_str = flags.toString(36)
				return coord_str + flags_str
			})
			.sort()
			.join('')
	}

	/**
	 * Decodes a configuration string produced by {@link encode_pieces}.
	 */
	static decode_pieces_config(pieces_config: string): Piece[] {
		const result: Piece[] = []
		const seen = new Set<number>()

		for (let i = 0; i < pieces_config.length; i += 3) {
			const coord_str = pieces_config.slice(i, i + 2)
			const flags_str = pieces_config[i + 2]

			const index = parseInt(coord_str, 36)
			const is_valid_index = index >= 0 && index < 81
			if (!is_valid_index) {
				throw new Error(`Invalid piece index: ${coord_str}`)
			}

			const flags = parseInt(flags_str, 36)
			const is_valid_flags = flags >= 0 && flags < 32
			if (!is_valid_flags) {
				throw new Error(`Invalid flags: ${flags_str}`)
			}

			const x = index % 9
			const y = Math.floor(index / 9)
			const type = Math.floor(x / 3) + Math.floor(y / 3) * 3

			const piece = new Piece(
				x,
				y,
				type,
				x,
				y,
				Boolean(flags & 0b10000),
				Boolean(flags & 0b01000),
				Boolean(flags & 0b00100),
				Boolean(flags & 0b00010),
				Boolean(flags & 0b00001),
			)

			result.push(piece)
			seen.add(index)
		}

		for (let y = 0; y < 9; y++) {
			for (let x = 0; x < 9; x++) {
				const index = y * 9 + x
				if (seen.has(index)) continue
				const type = Math.floor(x / 3) + Math.floor(y / 3) * 3
				const piece = new Piece(x, y, type)
				result.push(piece)
			}
		}

		return result
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
	static encode_sets(sets: number[][]): string {
		return sets
			.map((subset) => {
				let mask = 0
				for (const n of subset) {
					if (n < 0 || n > 8)
						throw new Error('Element out of range 0...8')
					mask |= 1 << n
				}
				return mask.toString(36).padStart(2, '0')
			})
			.sort()
			.join('')
	}

	/**
	 * Decode a string produced by {@link encode_sets} back into an array of subsets.
	 */
	static decode_sets(encoded: string): number[][] {
		if (encoded.length % 2 !== 0) throw new Error('Invalid encoding length')

		const sets: number[][] = []

		for (let i = 0; i < encoded.length; i += 2) {
			const chunk = encoded.slice(i, i + 2)
			const mask = parseInt(chunk, 36)
			if (Number.isNaN(mask))
				throw new Error(`Invalid base-36 chunk: ${chunk}`)

			const subset: number[] = []

			for (let bit = 0; bit < 9; bit++) {
				if (mask & (1 << bit)) subset.push(bit)
			}

			sets.push(subset)
		}

		return sets
	}
}
