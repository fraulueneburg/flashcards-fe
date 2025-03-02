import { useState, useEffect, useContext } from 'react'
import { API_URL } from '../config'
import axios from 'axios'
import { CardsContext } from '../context/cards.context'
import { ModalProvider } from '../context/modal.context'
import Modal from '../components/organisms/Modal'
import Card from '../components/atoms/Card'

import { Check as IconCheck, X as IconX } from '@phosphor-icons/react'

function Practice() {
	const { allCardsArr } = useContext(CardsContext)
	const [practiceMode, setPracticeMode] = useState(false)
	const [currCard, setCurrCard] = useState()
	const [currCardPos, setCurrCardPos] = useState(0)

	const [practiceArr, setPracticeArr] = useState(allCardsArr)
	const [difficultArr, setDifficultArr] = useState([])
	const [retiredArr, setRetiredArr] = useState([])

	useEffect(() => {
		const today = new Date()
		setPracticeArr(allCardsArr.filter((elem) => elem.reviewDate <= today.toISOString() && elem.retired === false))
		setDifficultArr(allCardsArr.filter((elem) => elem.difficult === true))
		setRetiredArr(allCardsArr.filter((elem) => elem.retired === true))
	}, [allCardsArr])

	useEffect(() => {
		setCurrCard(practiceArr[currCardPos])
	}, [practiceArr, currCardPos])

	const handleAnswer = async (answer) => {
		try {
			const updatedCard = await axios.post(`${API_URL}/cards/${currCard._id}/answer/${answer}`)

			// find card in practiceArr (and allCardsArr?)
			// update content
			// if answer == right => move card to end of array

			// move to next card / end practice
			const anyCardsLeft = currCardPos < practiceArr.length - 1
			anyCardsLeft ? setCurrCardPos((prev) => prev + 1) : setPracticeMode(false)

			if (answer === 'wrong') {
				setDifficultArr((prev) => [...prev, updatedCard.data])
			}
			console.log(difficultArr)

			console.log('updated card', updatedCard.data)
		} catch (error) {
			console.error('Error reviewing flashcard:', error)
		}
	}

	return (
		<>
			<h1>Practice</h1>
			<div className="grid">
				<article>
					<h2>
						{practiceArr.length} <small>cards</small>
					</h2>
					<p>to review today</p>
					<button onClick={() => setPracticeMode(true)}>practice</button>
					<button disabled>see cards</button>
				</article>
				<article>
					<h2>{difficultArr.length}</h2>
					<p>difficult cards</p>
					<button disabled>practice</button>
					<button disabled>see cards</button>
				</article>
				<article>
					<h2>{retiredArr.length}</h2>
					<p>retired cards</p>
					<button disabled>practice</button>
					<button disabled>see cards</button>
				</article>
			</div>
			{practiceMode ? (
				<ModalProvider>
					<Modal
						modalIsOpen={practiceMode}
						onCancel={() => setPracticeMode(false)}
						description={
							<>
								<h1>
									{currCardPos + 1} / {practiceArr.length}
								</h1>
								<Card id={currCard._id} content={currCard} />
								<footer>
									<button
										className="btn-icon btn-danger"
										onClick={() => handleAnswer('wrong')}
										aria-label="I didn’t know this answer">
										<IconX />
									</button>
									<button
										className="btn-icon btn-success"
										onClick={() => handleAnswer('right')}
										aria-label="I knew this answer">
										<IconCheck />
									</button>
								</footer>
							</>
						}
					/>
				</ModalProvider>
			) : null}
		</>
	)
}

export default Practice
