<script lang="ts">
	type Props = {
		type: 'row' | 'col'
		disabled: boolean
		index: number
		active: boolean
		connect: () => void
		remove: () => void
		group: number
	}

	let { type, disabled, index, active, connect, remove, group }: Props =
		$props()
</script>

<button
	class="connector"
	data-type={type}
	{disabled}
	class:active
	aria-label="Connect {type} {index}"
	style:--i={index}
	onclick={connect}
	ondblclick={remove}
	data-group={group}
>
</button>

<style>
	.connector {
		position: absolute;
		transform: translate(-50%, -50%);
		width: calc(0.25 * var(--u));
		aspect-ratio: 1;
		border-radius: 50%;
		background-color: var(--color, var(--btn-color));
		transition: opacity 200ms;

		&.active:not(:disabled) {
			outline: 1px solid var(--outline-color);
		}

		&:disabled[data-group='-1'] {
			opacity: 0;
		}

		&[data-type='row'] {
			top: calc(var(--i) * var(--u) + var(--u) / 2);
			left: calc(var(--size) + 0.25 * var(--u));

			&[data-group='0'] {
				--color: var(--color-0);
			}

			&[data-group='1'] {
				--color: var(--color-2);
			}

			&[data-group='2'] {
				--color: var(--color-4);
			}

			&[data-group='3'] {
				--color: var(--color-6);
			}
		}

		&[data-type='col'] {
			top: calc(var(--size) + 0.25 * var(--u));
			left: calc(var(--i) * var(--u) + var(--u) / 2);

			&[data-group='0'] {
				--color: var(--color-1);
			}

			&[data-group='1'] {
				--color: var(--color-3);
			}

			&[data-group='2'] {
				--color: var(--color-5);
			}

			&[data-group='3'] {
				--color: var(--color-7);
			}
		}
	}
</style>
