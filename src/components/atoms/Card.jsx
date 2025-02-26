import { useState, useEffect, useContext, useRef, useId } from 'react'
import { API_URL } from '../../config'
import axios from 'axios'
import { CardsContext } from '../../context/cards.context'
import { ModalProvider } from '../../context/modal.context'
import Modal from '../organisms/Modal'
import MarkdownIt from 'markdown-it'
import FormCard from '../molecules/FormCard'
import Pill from './Pill'

import {
	ArrowClockwise as IconRotateCw,
	ArrowCounterClockwise as IconRotateCcw,
	Check as IconCheck,
	ChartLine as IconStats,
	DotsThreeVertical as IconMore,
	Pencil as IconEdit,
	Trash as IconDelete,
	X as IconX,
} from '@phosphor-icons/react'

function Card(props) {
	const { setAllCardsArr, setFilteredCardsArr, fetchCollectionsData, defaultIconWeight } = useContext(CardsContext)
	const { content_front, content_back } = props.content
	const collections = props.content.collections.sort(function (a, b) {
		if (a.name.toLowerCase() < b.name.toLowerCase()) {
			return -1
		}
		if (a.name.toLowerCase() > b.name.toLowerCase()) {
			return 1
		}
		return 0
	})
	const md = new MarkdownIt()
	const cardId = props.id || undefined
	const uniqueId = useId()
	const sideMenuRef = useRef(null)

	const [isFlipped, setIsFlipped] = useState(false)
	const [isMenuExpanded, setIsMenuExpanded] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const [deleteMode, setDeleteMode] = useState(false)

	// delete card

	const handleDelete = async (e) => {
		e.preventDefault()

		try {
			await axios.delete(`${API_URL}/cards/${cardId}/delete`)
			const filterId = cardId
			setAllCardsArr((prevCards) => prevCards.filter((e) => e._id !== filterId))
			setFilteredCardsArr((prevCards) => prevCards.filter((e) => e._id !== filterId))
			fetchCollectionsData()
			setDeleteMode(false)
		} catch (err) {
			console.log('ERROR', err)
		}
	}

	// close sidemenu on click outside

	const handleClickOutside = (event) => {
		if (sideMenuRef.current && !sideMenuRef.current.contains(event.target)) {
			setIsMenuExpanded(false)
		}
	}

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('focusin', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('focusin', handleClickOutside)
		}
	}, [isMenuExpanded])

	return (
		<>
			{editMode ? (
				<ModalProvider>
					<Modal
						modalClassName="modal-edit"
						modalIsOpen={editMode}
						onCancel={() => {
							setEditMode(false)
							setIsMenuExpanded(false)
						}}
						description={
							<>
								<FormCard
									id={cardId}
									content={props.content}
									onSubmitFunction={() => {
										setEditMode(false)
										setIsMenuExpanded(false)
									}}
								/>
							</>
						}
					/>
				</ModalProvider>
			) : null}
			{deleteMode ? (
				<ModalProvider>
					<Modal
						modalClassName="modal-delete"
						description={
							<>
								<p>Do you really want to delete this card?</p>
							</>
						}
						buttonLabel={'Yes, delete'}
						buttonClass={'btn-danger'}
						onConfirm={handleDelete}
						modalIsOpen={deleteMode}
						onCancel={() => {
							setDeleteMode(false)
							setIsMenuExpanded(false)
						}}
					/>
				</ModalProvider>
			) : null}
			<article className={isFlipped ? 'flashcard flipped' : 'flashcard'}>
				<section className="front">
					<div
						className="content"
						dangerouslySetInnerHTML={{ __html: md.render(content_front) }}
						onClick={() => setIsFlipped(!isFlipped)}
					/>
					{collections?.length > 0 ? (
						<footer>
							<ul className="list-unstyled list-horizontal">
								{collections.map((elem) => (
									<li key={`${uniqueId}-${elem._id}`}>
										<Pill data={elem} />
									</li>
								))}
							</ul>
						</footer>
					) : null}
				</section>
				<aside ref={sideMenuRef}>
					<button
						className="btn-icon secondary"
						aria-label="open card actions"
						aria-expanded={isMenuExpanded}
						aria-controls={`menu-${uniqueId}`}
						onClick={() => setIsMenuExpanded(!isMenuExpanded)}>
						<IconMore weight="bold" />
					</button>
					<nav id={`menu-${uniqueId}`}>
						<ul>
							<li>
								<button className="btn-icon" aria-label="delete item">
									<IconStats weight={defaultIconWeight} />
								</button>
							</li>
							<li>
								<button onClick={() => setEditMode(!editMode)} className="btn-icon" aria-label="edit item">
									<IconEdit weight={defaultIconWeight} />
								</button>
							</li>

							<li>
								<button onClick={() => setDeleteMode(!deleteMode)} className="btn-icon btn-danger" aria-label="delete item">
									<IconDelete weight={defaultIconWeight} />
								</button>
							</li>
						</ul>
					</nav>
					<button
						onClick={() => setIsFlipped(!isFlipped)}
						className="btn-icon btn-flip secondary"
						aria-label="flip card"
						aria-pressed={isFlipped}>
						{isFlipped ? <IconRotateCcw /> : <IconRotateCw />}
					</button>
				</aside>
				<section className="back">
					<div
						className="content"
						dangerouslySetInnerHTML={{ __html: md.render(content_back) }}
						onClick={() => setIsFlipped(!isFlipped)}
					/>
					<footer>
						<button className="btn-icon btn-danger" aria-label="I didn’t know this answer">
							<IconX />
						</button>
						<button className="btn-icon btn-success" aria-label="I knew this answer">
							<IconCheck />
						</button>
					</footer>
				</section>
			</article>
		</>
	)
}

export default Card
