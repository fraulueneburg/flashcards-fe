import { useState, useEffect, useContext, useId } from 'react'
import { API_URL } from '../../config'
import { CardsContext } from '../../context/cards.context'
import axios from 'axios'
import MarkdownEditor from '../atoms/MarkdownEditor'
import DropdownColor from '../atoms/DropdownColor'
import Pill from '../atoms/Pill'
import { nanoid } from 'nanoid'

const FormCard = (props) => {
	const { id, onSubmitFunction } = props
	const { content_front = '', content_back = '', tags = [] } = props.content || {}
	const { setAllCardsArr, allTagsArr, fetchTagsData } = useContext(CardsContext)

	const uniqueId = useId()
	const [filteredTagsArr, setFilteredTagsArr] = useState(allTagsArr)
	const [formData, setFormData] = useState({
		_id: id,
		content_front: content_front,
		content_back: content_back,
		tags: tags,
	})

	const [newTagName, setNewTagName] = useState('')
	const [newTagColor, setNewTagColor] = useState('')
	const [newTagNameError, setNewTagNameError] = useState('')

	const handleChangeNewTagName = (event) => {
		event.preventDefault()
		setNewTagNameError('')
		setNewTagName(event.target.value)
	}

	const handleAddNewTag = (event) => {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault()
			const trimmedName = newTagName.trim()

			if (trimmedName.length > 0) {
				const wasAlreadyAdded = formData.tags.some((elem) => elem.name.toLowerCase() === trimmedName.toLowerCase())
				const existingTag = filteredTagsArr.find((elem) => elem.name.toLowerCase() === trimmedName.toLowerCase())

				if (trimmedName.length < 2) {
					setNewTagNameError('Tag name needs at least two characters')
				} else if (wasAlreadyAdded) {
					setNewTagNameError('Tag was already added')
				} else if (existingTag) {
					addNewTag(existingTag)
					setNewTagName('')
				} else {
					addNewTag({
						_id: nanoid(),
						name: newTagName,
						color: newTagColor,
						cards: [id],
					})
					setNewTagName('')
				}
			}
		}
	}

	const addNewTag = (tagElem) => {
		setFormData((prevData) => ({
			...prevData,
			tags: [...prevData.tags, tagElem],
		}))
	}

	const handleRemoveTag = (tagElem) => {
		setFormData((prevData) => ({
			...prevData,
			tags: [...prevData.tags.filter((elem) => elem._id !== tagElem._id)],
		}))
	}

	// filter existing tags
	// every time a tag is added or removed from card
	useEffect(() => {
		const tagIds = new Set(formData.tags.map((item) => item._id))
		setFilteredTagsArr(allTagsArr.filter((item) => !tagIds.has(item._id)))
	}, [formData.tags, allTagsArr])

	// Set default color received from the child
	const handleDropdownInitColor = (initColor) => {
		setNewTagColor(initColor)
	}

	// cycle through colors
	// useEffect(() => {
	// 	const nextColourIndex = formData.tags?.length % colorsArr.length || 0
	// 	setNewTagColor(colorsArr[nextColourIndex].name)
	// }, [formData.tags])

	// add new card
	// update existing card

	const handleSubmit = async (event) => {
		event.preventDefault()
		const isNewCard = !formData._id

		try {
			if (isNewCard) {
				const response = await axios.post(`${API_URL}/cards`, formData)
				const newCard = response.data

				setAllCardsArr((prevArr) => [newCard, ...prevArr])
				setFormData({
					_id: undefined,
					content_front: '',
					content_back: '',
					tags: [],
				})
			} else {
				// update existing card
				const cardId = formData._id
				const updatedCard = await axios.put(`${API_URL}/cards/${cardId}`, formData)

				setAllCardsArr((prevCards) => prevCards.map((item) => (item._id === cardId ? updatedCard.data : item)))
			}
			fetchTagsData()
			onSubmitFunction?.()
		} catch (err) {
			console.log('ERROR', err)
		}
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<div className="grid">
					<MarkdownEditor
						label="Front"
						className="front"
						value={formData.content_front}
						onChange={(elem) => setFormData({ ...formData, content_front: elem })}
						placeholder="Enter front content (markdown)"
					/>
					<MarkdownEditor
						label="Back"
						className="back"
						value={formData.content_back}
						onChange={(elem) => setFormData({ ...formData, content_back: elem })}
						placeholder="Enter back content (markdown)"
					/>
				</div>
				<fieldset>
					<legend>Tags</legend>
					{formData.tags?.length > 0 ? (
						<ul aria-live="polite" className="list-unstyled list-horizontal list-pills">
							{formData.tags.map((elem) => (
								<li key={elem._id}>
									<Pill data={elem} type="remove" action={() => handleRemoveTag(elem)} />
								</li>
							))}
						</ul>
					) : null}
					<div className="group">
						<div style={{ width: '100%' }}>
							<label className="sr-only" htmlFor={`${uniqueId}-new-tag`}>
								New Tag Name
							</label>
							<input
								type="text"
								placeholder="New Tag Name"
								id={`${uniqueId}-new-tag`}
								list={`${uniqueId}-new-tag-datalist`}
								value={newTagName}
								onChange={handleChangeNewTagName}
								onKeyDown={handleAddNewTag}
								aria-invalid={newTagNameError ? true : null}
								aria-errormessage={`${uniqueId}-new-tag-name-error`}
							/>
							{filteredTagsArr.length > 0 ? (
								<ul className="suggestions list-unstyled list-horizontal">
									{filteredTagsArr.map((elem) => (
										<li key={elem._id}>
											<Pill data={elem} type="add" action={() => addNewTag(elem)} />
										</li>
									))}
								</ul>
							) : null}
							{newTagNameError ? (
								<p>
									<small id={`${uniqueId}-new-tag-name-error`}>{newTagNameError}</small>
								</p>
							) : null}
							<small className="sr-only" id={`${uniqueId}-new-tag-description`}>
								Type a name, then press Comma or Enter to add the tag to the list
							</small>
						</div>
						<DropdownColor onInitColor={handleDropdownInitColor} onColorChange={setNewTagColor} />
					</div>
				</fieldset>
				<button type="submit">Save Card</button>
			</form>
		</>
	)
}

export default FormCard
