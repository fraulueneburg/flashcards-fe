import { useId, useEffect, useState, useRef } from 'react'
import { CaretDown as IconChevronDown, Check as IconCheck } from '@phosphor-icons/react'
import colorsArrJSON from '../../data/colors.json'

export default function DropdownColor(props) {
	const { onInitColor, onColorChange } = props
	const colorsArr = colorsArrJSON
	const idPrefix = useId()
	const listId = `${idPrefix}-color-list`
	const buttonRef = useRef(null)
	const fieldsetRef = useRef(null)

	const [selectedColor, setSelectedColor] = useState(colorsArr[0].name)
	const [isListOpen, setIsListOpen] = useState(props.isListOpen || false)

	useEffect(() => {
		onInitColor(selectedColor)
	}, [])

	const handleChange = (name) => {
		onColorChange(name)
		setSelectedColor(name)
	}

	const handleToggleColorOptions = (event) => {
		event.preventDefault()
		setIsListOpen((prevState) => !prevState)
	}

	// Close list on esc or when focus moves outside

	// const handleClickOutside = (event) => {
	// 	if (fieldsetRef.current && !fieldsetRef.current.contains(event.target)) {
	// 		setIsListOpen(false)
	// 	}
	// }
	const handleKeyDown = (event) => {
		if (event.key === 'Escape' && isListOpen) {
			setIsListOpen(false)
			if (buttonRef.current) buttonRef.current.focus()
		}
	}
	useEffect(() => {
		// document.addEventListener('mousedown', handleClickOutside)
		// document.addEventListener('focusin', handleClickOutside)
		document.addEventListener('keydown', handleKeyDown)

		return () => {
			// document.removeEventListener('mousedown', handleClickOutside)
			// document.removeEventListener('focusin', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isListOpen, setIsListOpen])

	return (
		<fieldset className="radio-group radio-group-color" ref={fieldsetRef}>
			<legend className="sr-only">Color</legend>
			<strong className="sr-only" aria-live="polite">
				selected color: {selectedColor}
			</strong>
			<button
				type="button"
				className="btn-inline btn-toggle-colors"
				onClick={handleToggleColorOptions}
				aria-label="toggle color options"
				aria-controls={listId}
				aria-expanded={isListOpen}
				ref={buttonRef}>
				<div className="color-option FOO" style={{ color: `var(--pico-color-${selectedColor})` }}></div>
				<IconChevronDown aria-hidden="true" />
			</button>
			<div className="dropdown-list color-list" id={listId}>
				{colorsArr.map((elem) => {
					const uniqueId = `${idPrefix}-${elem.name}`
					const isChecked = selectedColor === elem.name

					return (
						<label key={uniqueId} htmlFor={uniqueId} className={isChecked ? 'checked' : null}>
							<input
								id={uniqueId}
								type="radio"
								name="newColor"
								value={elem.name}
								checked={isChecked}
								onChange={() => handleChange(elem.name)}
							/>
							<div className="color-option" style={{ color: `var(--pico-color-${elem.name})` }}>
								{selectedColor === elem.name ? <IconCheck aria-hidden="true" /> : null}
							</div>
							<span className="sr-only">{elem.name}</span>
						</label>
					)
				})}
			</div>
		</fieldset>
	)
}
