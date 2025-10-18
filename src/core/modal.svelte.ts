export let modal_data = $state({
	open: false,
	question: '',
	onconfirm: () => {},
})

export function open_modal(question: string, onconfirm: () => void) {
	modal_data.question = question
	modal_data.onconfirm = onconfirm
	modal_data.open = true
}

export function confirm_modal() {
	modal_data.onconfirm()
	close_modal()
}

export function close_modal() {
	modal_data.open = false
	modal_data.question = ''
	modal_data.onconfirm = () => {}
}
