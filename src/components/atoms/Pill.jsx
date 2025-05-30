import { X as IconX, Plus as IconPlus } from '@phosphor-icons/react'

export default function Pill(props) {
	const { type, action, active } = props
	const { name, color, cards } = props.data
	const classes = props.classes ? `pill ${props.classes}` : `pill`
	const pillStyle = color ? { backgroundColor: `var(--pico-color-${color})` } : null

	const renderContent = () => {
		switch (type) {
			case 'default':
				return <span className="name">{name}</span>
			case 'filter':
				return (
					<button onClick={action} role="switch" aria-checked={active}>
						<span className="name">{name}</span>
						<sup className="num" aria-hidden="true">
							{cards.length}
						</sup>
					</button>
				)
			case 'add':
				return (
					<>
						<button type="button" onClick={action} aria-label={`add tag ${name}`}>
							<span className="name">{name}</span>
							<IconPlus weight="bold" />
						</button>
					</>
				)
			case 'remove':
				return (
					<>
						<button type="button" onClick={action} aria-label={`remove tag ${name}`}>
							<span className="name">{name}</span>
							<IconX />
						</button>
					</>
				)
			default:
				return <span className="name">{name}</span>
		}
	}

	return (
		<div className={classes} style={pillStyle}>
			{renderContent()}
		</div>
	)
}
