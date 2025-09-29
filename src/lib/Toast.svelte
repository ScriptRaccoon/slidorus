<script lang="ts" module>
	type Toast_Variant = 'info' | 'success' | 'error'

	type Toast_Position =
		| 'top-left'
		| 'top-center'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-center'
		| 'bottom-right'

	type Toast = {
		id: string
		title: string
		variant: Toast_Variant
		duration: number
	}

	const default_toast = {
		title: '',
		variant: 'info',
		duration: 3000,
	} as const

	let toast_items = $state<Toast[]>([])

	export function send_toast(toast: Partial<Toast>): void {
		const id = Math.random().toString(36).slice(2)
		const _toast: Toast = {
			...default_toast,
			...toast,
			id,
		}

		toast_items.push(_toast)

		setTimeout(() => {
			delete_toast(_toast)
		}, _toast.duration)
	}

	function delete_toast(toast: Toast) {
		toast_items = toast_items.filter((t) => t.id != toast.id)
	}
</script>

<script lang="ts">
	import { Ban, Info, PartyPopper } from '@lucide/svelte'

	import { fly } from 'svelte/transition'

	type Props = {
		position: Toast_Position
	}

	let { position }: Props = $props()

	let offset_y = $derived(position.includes('top') ? -50 : 50)
</script>

<div class="container {position.replace('-', ' ')}" aria-live="assertive">
	{#each toast_items as toast (toast.id)}
		<button
			class="toast {toast.variant}"
			transition:fly={{ y: offset_y, duration: 200 }}
			onclick={() => delete_toast(toast)}
		>
			{#if toast.variant === 'info'}
				<Info />
			{:else if toast.variant === 'success'}
				<PartyPopper />
			{:else if toast.variant === 'error'}
				<Ban />
			{/if}
			{toast.title}
		</button>
	{/each}
</div>

<style>
	.container {
		position: fixed;
		z-index: 10000;
		pointer-events: none;
		padding: 1rem;
		display: flex;
		gap: 1rem;

		&.top {
			top: 0;
			flex-direction: column;
		}

		&.bottom {
			bottom: 0;
			flex-direction: column-reverse;
		}

		&.left {
			left: 0;
			align-items: start;
		}

		&.right {
			right: 0;
			align-items: end;
		}

		&.center {
			left: 0;
			right: 0;
			align-items: center;
		}
	}

	.toast {
		display: flex;
		width: fit-content;
		align-items: center;
		max-width: 20rem;
		border-radius: 0.25rem;
		box-shadow: 0.1rem 0.1rem 0.4rem #0003;
		padding: 0.5rem 1rem;
		pointer-events: initial;
		font-size: 1.125rem;
		font-weight: bold;
		gap: 0.5rem;

		&.info {
			background-color: white;
			color: black;
		}

		&.success {
			background-color: var(--success-color);
			color: white;
		}

		&.error {
			background-color: var(--error-color);
			color: white;
		}
	}
</style>
