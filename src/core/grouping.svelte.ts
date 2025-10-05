export class Grouping<T> {
	groups: T[][]

	constructor() {
		this.groups = $state([])
	}

	reset() {
		this.groups = []
	}

	merge(a: T, b: T) {
		const group_a = this.groups.find((c) => c.includes(a))
		const group_b = this.groups.find((c) => c.includes(b))

		if (!group_a && !group_b) {
			this.groups.push([a, b])
		} else if (group_a && !group_b) {
			group_a.push(b)
		} else if (group_b && !group_a) {
			group_b.push(a)
		} else if (group_a && group_b) {
			this.groups = this.groups.filter((c) => c != group_b)
			group_a.push(...group_b)
		}
	}

	remove_group(a: T) {
		const group = this.groups.find((group) => group.includes(a))
		if (group) this.groups = this.groups.filter((_group) => group != _group)
	}

	get_group_index(a: T) {
		return this.groups.findIndex((group) => group.includes(a))
	}

	close(set: Set<T>) {
		for (const group of this.groups) {
			const has_intersection = group.some((a) => set.has(a))
			if (!has_intersection) continue
			for (const element of group) {
				set.add(element)
			}
		}
	}
}
