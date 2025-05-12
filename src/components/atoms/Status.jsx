import '../../scss/statusbar.scss'

export default function Status(props) {
	const { label, currNum, total } = props
	const progress = (currNum / total) * 100

	return (
		<>
			<div className="status-bar" aria-live="polite" aria-label={`${label} ${currNum} of ${total}`}>
				<span className="label" aria-hidden="true">
					{currNum} / {total}
				</span>
				<div className="bar-container">
					<div className="bar" style={{ width: `${progress}%` }} />
				</div>
			</div>
		</>
	)
}
