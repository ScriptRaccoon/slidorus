export let modal_data = $state({
	open: false,
	question: '',
	onconfirm: () => {},
	oncancel: () => {},
})

export function open_modal(
	question: string,
	onconfirm: () => void,
	oncancel: () => void = () => {},
) {
	modal_data.question = question
	modal_data.onconfirm = onconfirm
	modal_data.oncancel = oncancel
	modal_data.open = true
}

export function confirm_modal() {
	modal_data.onconfirm()
	reset_modal()
}

export function cancel_modal() {
	modal_data.oncancel()
	reset_modal()
}

export function reset_modal() {
	modal_data.open = false
	modal_data.question = ''
	modal_data.onconfirm = () => {}
	modal_data.oncancel = () => {}
}
