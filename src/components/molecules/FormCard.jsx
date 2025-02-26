//import { AuthContext } from '../context/auth.context'
// import FormTags from './FormTags'
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
	const { content_front = '', content_back = '', collections = [] } = props.content || {}
	const { setAllCardsArr, allCollectionsArr, fetchCollectionsData } = useContext(CardsContext)

	const uniqueId = useId()
	const [filteredCollectionsArr, setFilteredCollectionsArr] = useState(allCollectionsArr)
	const [formData, setFormData] = useState({
		_id: id,
		content_front: content_front,
		content_back: content_back,
		collections: collections,
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
				const wasAlreadyAdded = formData.collections.some((elem) => elem.name.toLowerCase() === trimmedName.toLowerCase())
				const existingTag = filteredCollectionsArr.find((elem) => elem.name.toLowerCase() === trimmedName.toLowerCase())

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
			collections: [...prevData.collections, tagElem],
		}))
	}

	const handleRemoveTag = (tagElem) => {
		setFormData((prevData) => ({
			...prevData,
			collections: [...prevData.collections.filter((elem) => elem._id !== tagElem._id)],
		}))
	}

	// filter existing tags
	// every time a collection is added or removed from card
	useEffect(() => {
		const collectionIds = new Set(formData.collections.map((item) => item._id))
		setFilteredCollectionsArr(allCollectionsArr.filter((item) => !collectionIds.has(item._id)))
	}, [formData.collections, allCollectionsArr])

	// Set default color received from the child
	const handleDropdownInitColor = (initColor) => {
		setNewTagColor(initColor)
	}

	// cycle through colors
	// useEffect(() => {
	// 	const nextColourIndex = formData.collections?.length % colorsArr.length || 0
	// 	setNewTagColor(colorsArr[nextColourIndex].name)
	// }, [formData.collections])

	// add new card
	// update existing card

	const handleSubmit = async (event) => {
		event.preventDefault()
		try {
			if (!formData._id) {
				// add new card
				const response = await axios.post(`${API_URL}/cards/add`, formData)
				const newCard = response.data

				setAllCardsArr((prevArr) => [newCard, ...prevArr])
				setFormData({
					_id: undefined,
					content_front: '',
					content_back: '',
					collections: [],
				})
			} else {
				// update existing card
				const cardId = formData._id
				const updatedCard = await axios.post(`${API_URL}/cards/${cardId}/update`, formData)

				setAllCardsArr((prevCards) => prevCards.map((item) => (item._id === cardId ? updatedCard.data : item)))
			}
			fetchCollectionsData()
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
						value={formData.content_front}
						onChange={(elem) => setFormData({ ...formData, content_front: elem })}
						placeholder="Enter front content (markdown)"
					/>
					<MarkdownEditor
						label="Back"
						value={formData.content_back}
						onChange={(elem) => setFormData({ ...formData, content_back: elem })}
						placeholder="Enter back content (markdown)"
					/>
				</div>
				<fieldset>
					<legend>Tags</legend>
					{formData.collections?.length > 0 ? (
						<ul aria-live="polite" className="list-unstyled list-horizontal list-pills">
							{formData.collections.map((elem) => (
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
							{filteredCollectionsArr.length > 0 ? (
								<ul className="suggestions list-unstyled list-horizontal">
									{filteredCollectionsArr.map((elem) => (
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
