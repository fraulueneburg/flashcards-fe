//import { AuthContext } from '../context/auth.context'
// import FormTags from './FormTags'
import { useState, useEffect, useContext, useId } from 'react'
import { API_URL } from '../../config'
import { CardsContext } from '../../context/cards.context'
import axios from 'axios'
import MarkdownEditor from '../atoms/MarkdownEditor'
import DropdownColor from '../atoms/DropdownColor'
import colorsArr from '../../data/colors.json'
import { X as IconX } from '@phosphor-icons/react'
import Pill from '../atoms/Pill'

const FormCard = (props) => {
	const { id } = props
	const { content_front = '', content_back = '', collections = [] } = props.content || {}
	const { allCardsArr, setAllCardsArr, allCollectionsArr } = useContext(CardsContext)
	const allCollectionIdsSet = new Set(allCollectionsArr.map((item) => item._id))

	const [formData, setFormData] = useState({
		_id: id,
		content_front: content_front,
		content_back: content_back,
		collections: collections,
	})

	console.log('formData', formData)

	const [filteredCollectionsArr, setFilteredCollectionsArr] = useState(() => {
		const collectionIds = new Set(collections.map((item) => item._id))
		return allCollectionsArr.filter((item) => !collectionIds.has(item._id))
	})

	const [newTagName, setNewTagName] = useState('')
	const [newTagColor, setNewTagColor] = useState('')
	const [newTagNameError, setNewTagNameError] = useState('')
	const uniqueId = useId()

	const handleChangeNewTagName = (event) => {
		event.preventDefault()
		setNewTagNameError(false)
		setNewTagName(event.target.value)
	}

	// useEffect(() => {
	// 	console.log('filteredCollectionsArr', filteredCollectionsArr)
	// 	console.log('formData.collections', formData.collections)
	// 	console.log('---------------------------------')
	// }, [filteredCollectionsArr, formData])

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault()
			addNewTag(newTagName)
		}
	}

	const addNewTag = (tagName) => {
		const trimmedTag = tagName.trim()
		const isDuplicate = formData.collections.some((elem) => elem.name.toLowerCase() === trimmedTag.toLowerCase())

		if (isDuplicate) {
			setNewTagNameError(true)
		} else if (trimmedTag.length > 0) {
			setFormData((prevData) => ({
				...prevData,
				collections: [...prevData.collections, { name: trimmedTag, color: newTagColor }],
			}))
			setNewTagName('')
			setNewTagNameError(false)
		}
	}

	const addExistingTag = (tagElem) => {
		console.log('add tagElem', tagElem)
		setFormData((prevData) => ({
			...prevData,
			collections: [...prevData.collections, tagElem],
		}))
		setFilteredCollectionsArr((prevData) => prevData.filter((elem) => elem._id !== tagElem._id))
	}

	const handleRemoveTag = (tagElem) => {
		setFormData((prevData) => ({
			...prevData,
			collections: [...prevData.collections.filter((elem) => elem._id !== tagElem._id)],
		}))
		if (allCollectionIdsSet.has(tagElem._id)) {
			setFilteredCollectionsArr((prevData) => [...prevData, tagElem])
		}
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

		console.log('formData on send', formData)

		try {
			if (!formData._id) {
				const { data } = await axios.post(`${API_URL}/cards/add`, formData)
				const newCard = data
				setAllCardsArr((prevArr) => [newCard, ...prevArr])

				setFormData({
					_id: undefined,
					content_front: '',
					content_back: '',
					collections: [],
				})
			} else {
				const cardId = formData._id
				const { data } = await axios.post(`${API_URL}/cards/${cardId}/update`, formData)
				const cardIndex = allCardsArr.findIndex((elem) => elem._id === cardId)
				setAllCardsArr((prevCards) => {
					const newCardsArr = [...prevCards]
					newCardsArr[cardIndex] = data
					return newCardsArr
				})
			}
		} catch (err) {
			console.log('ERROR', err)
		}
	}

	const handleFoo = () => {
		console.log('tag clicked')
		console.log('formData', formData)
	}

	console.log('form props', props)
	console.log('collections', collections)
	console.log('formData.collections', formData)

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
					{collections?.length > 0 ? (
						<ul aria-live="polite" className="list-unstyled list-horizontal list-pills">
							{formData.collections.map((elem) => (
								<li key={elem._id}>
									<Pill data={elem} type="remove" action={handleRemoveTag(elem)} />
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
								onKeyDown={handleKeyDown}
								aria-invalid={newTagNameError ? true : null}
								aria-errormessage={`${uniqueId}-new-tag-name-error`}
							/>
							<ul className="suggestions list-unstyled list-horizontal">
								{allCollectionsArr?.map((elem) => (
									<li key={elem._id}>
										<Pill data={elem} type="add" action={handleFoo} />
									</li>
								))}
							</ul>
							<small className="sr-only" id={`${uniqueId}-new-tag-description`}>
								Type a name, then press Comma or Enter to add the tag to the list
							</small>
							{newTagNameError ? (
								<p>
									<small id={`${uniqueId}-new-tag-name-error`}>Tag was already added</small>
								</p>
							) : null}
						</div>
						<DropdownColor colorsArr={colorsArr} selectedValue={newTagColor} setNewSelectedValue={setNewTagColor} />
					</div>
				</fieldset>
				<button type="submit">Save Card</button>
			</form>
		</>
	)
}

export default FormCard
