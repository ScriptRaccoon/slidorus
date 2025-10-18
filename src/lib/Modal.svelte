<script lang="ts">
	import {
		confirm_modal,
		modal_data,
		close_modal,
	} from '../core/modal.svelte'
</script>

{#if modal_data.open}
	<div class="backdrop"></div>
{/if}

<dialog
	class="modal"
	aria-modal="true"
	onclose={close_modal}
	open={modal_data.open}
>
	<div class="question">
		{modal_data.question}
	</div>

	<menu>
		<button class="btn" onclick={close_modal}>Cancel</button>
		<button class="btn" onclick={confirm_modal}>Ok</button>
	</menu>
</dialog>

<style>
	.modal {
		width: min(90vw, 28rem);
		background: var(--bg-color);
		color: inherit;
		font: inherit;
		border: none;
		outline: 1px solid var(--dark-outline-color);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 0 1rem #0004;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		background: #0004;
	}

	.question {
		font-size: 1.125rem;
	}

	menu {
		margin-top: 1rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
</style>
