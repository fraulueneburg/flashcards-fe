import { useState, useEffect, useContext, useRef, useId } from 'react'
import { API_URL } from '../../config'
import axios from 'axios'
import { CardsContext } from '../../context/cards.context'
import { ModalProvider } from '../../context/modal.context'
import Modal from '../organisms/Modal'
import MarkdownIt from 'markdown-it'
import FormCard from '../molecules/FormCard'
import Pill from './Pill'
import sortByName from '../../context/utils/sortByName'
import { differenceInCalendarDays, format, formatRelative, parseISO } from 'date-fns'
import {
	ArrowClockwise as IconRotateCw,
	ArrowCounterClockwise as IconRotateCcw,
	ChartLine as IconStats,
	DotsThreeVertical as IconMore,
	Pencil as IconEdit,
	Trash as IconDelete,
	X as IconX,
} from '@phosphor-icons/react'

function Flashcard(props) {
	const { setAllCardsArr, setFilteredCardsArr, fetchTagsData, defaultIconWeight } = useContext(CardsContext)
	const {
		content_front,
		content_back,
		difficult: isDifficult,
		retired: isRetired,
		reviewDate,
		lastReviewDate,
		createdAt,
		box,
	} = props.content
	const tags = sortByName(props.content.tags)
	const repeatIntervals = [1, 2, 7, 14, 28]

	const md = new MarkdownIt({ html: true, linkify: true })
	const cardId = props.id || undefined
	const uniqueId = useId()
	const sideMenuRef = useRef(null)
	const today = new Date()
	const formatDate = (dateString) => {
		const date = parseISO(dateString)
		return format(date, "do MMMM yyyy 'at' HH:mm")
	}

	const [isFlipped, setIsFlipped] = useState(false)
	const [isMenuExpanded, setIsMenuExpanded] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const [deleteMode, setDeleteMode] = useState(false)
	const [showStats, setShowStats] = useState(false)

	// flip to front if id changes

	useEffect(() => {
		setIsFlipped(false)
	}, [cardId])

	// delete card

	const handleDelete = async (e) => {
		e.preventDefault()

		try {
			await axios.delete(`${API_URL}/cards/${cardId}`)
			const filterId = cardId
			setAllCardsArr((prevCards) => prevCards.filter((e) => e._id !== filterId))
			setFilteredCardsArr((prevCards) => prevCards.filter((e) => e._id !== filterId))
			fetchTagsData()
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
			) : deleteMode ? (
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

			<article className={`flashcard${isFlipped ? ' flipped' : ''}${isDifficult ? ' difficult' : ''}`}>
				<section className="front">
					<div
						className="content"
						dangerouslySetInnerHTML={{ __html: md.render(content_front) }}
						onClick={() => setIsFlipped(!isFlipped)}
					/>
					{tags?.length > 0 ? (
						<footer>
							<ul className="list-unstyled list-horizontal list-tags">
								{tags.map((elem) => (
									<li key={`${uniqueId}-${elem._id}`}>
										<Pill data={elem} />
									</li>
								))}
								{isDifficult ? (
									<li>
										<Pill data={{ type: 'default', name: '⚡️' }} />
									</li>
								) : null}
							</ul>
						</footer>
					) : null}
				</section>
				<aside ref={sideMenuRef}>
					<button
						onClick={() => setIsFlipped(!isFlipped)}
						className="btn-icon btn-flip secondary"
						aria-label="flip card"
						aria-pressed={isFlipped}>
						{isFlipped ? <IconRotateCcw /> : <IconRotateCw />}
					</button>
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
								<button onClick={() => setEditMode(!editMode)} className="btn-icon" aria-label="edit item">
									<IconEdit weight={defaultIconWeight} />
								</button>
							</li>
							<li>
								<button onClick={() => setShowStats(true)} className="btn-icon" aria-label="see statistics">
									<IconStats weight={defaultIconWeight} />
								</button>
							</li>
							<li>
								<button onClick={() => setDeleteMode(!deleteMode)} className="btn-icon btn-danger" aria-label="delete item">
									<IconDelete weight={defaultIconWeight} />
								</button>
							</li>
						</ul>
					</nav>
				</aside>
				<section className="back">
					<div
						className="content"
						dangerouslySetInnerHTML={{ __html: md.render(content_back) }}
						onClick={() => setIsFlipped(!isFlipped)}
					/>
				</section>
				{showStats ? (
					<section className="stats">
						<button className="btn-close" onClick={() => setShowStats(false)} aria-label="close statistics">
							<IconX />
						</button>
						<div className="content">
							{isRetired ? (
								<>
									<p>
										<mark>retired card</mark>
									</p>
									<p>last review {formatDate(lastReviewDate)}</p>
								</>
							) : (
								<>
									<p>
										currently repeating <strong>every {box <= 1 ? 'day' : repeatIntervals[box - 1] + ' days'}</strong>
									</p>
									<p>
										next review{' '}
										<strong>
											{differenceInCalendarDays(reviewDate, today) <= 0
												? 'today'
												: differenceInCalendarDays(reviewDate, today) === 1
												? 'tomorrow'
												: `in  ${differenceInCalendarDays(reviewDate, today)} days`}
										</strong>
										<br />
										last review {formatDate(lastReviewDate)}
									</p>
								</>
							)}
							<p>
								<strong>created</strong> {formatRelative(createdAt, today, { weekStartsOn: 1 })}
							</p>
						</div>
					</section>
				) : null}
			</article>
		</>
	)
}

export default Flashcard
