import { useModal } from '../../context/modal.context'

export default function ModalButton({ children, ...props }) {
	const { handleOpen } = useModal()

	return (
		<button onClick={handleOpen} {...props}>
			{children}
		</button>
	)
}
