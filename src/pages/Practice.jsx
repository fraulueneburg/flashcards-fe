import { useState, useEffect, useContext } from 'react'
import { API_URL } from '../config'
import axios from 'axios'
import { CardsContext } from '../context/cards.context'
import { ModalProvider } from '../context/modal.context'
import Modal from '../components/organisms/Modal'
import Flashcard from '../components/atoms/Flashcard'
import Pill from '../components/atoms/Pill'

import { Check as IconCheck, X as IconX } from '@phosphor-icons/react'
import Status from '../components/atoms/Status'

function Practice() {
	const { allCardsArr } = useContext(CardsContext)
	const [practiceMode, setPracticeMode] = useState(false)

	const [todaysCardsArr, setTodaysCardsArr] = useState([])
	const [difficultCardsArr, setDifficultCardsArr] = useState([])
	const [retiredArr, setRetiredArr] = useState([])
	const [practiceArr, setPracticeArr] = useState([])

	const [currCard, setCurrCard] = useState()
	const [currCardPos, setCurrCardPos] = useState(0)

	useEffect(() => {
		const today = new Date()
		setTodaysCardsArr(allCardsArr.filter((elem) => elem.reviewDate <= today.toISOString() && elem.retired === false))
		setDifficultCardsArr(allCardsArr.filter((elem) => elem.difficult === true))
		setRetiredArr(allCardsArr.filter((elem) => elem.retired === true))
	}, [allCardsArr])

	useEffect(() => {
		setCurrCard(practiceArr[currCardPos])
	}, [currCardPos, practiceArr])

	const handleStartPractice = (arr) => {
		setPracticeArr(arr)
		setCurrCard(arr[currCardPos])
		setPracticeMode(true)
	}

	const handleSeeCards = (arr) => {
		setPracticeArr(arr)
	}

	const handleAnswer = async (isCorrectAnswer) => {
		const isLastCard = currCardPos === practiceArr.length - 1

		try {
			const updatedCard = await axios.patch(`${API_URL}/cards/${currCard._id}/review`, {
				isCorrectAnswer: isCorrectAnswer,
			})
			if (isCorrectAnswer) {
				// if answer == right => move card to end of array
			}
			if (!isCorrectAnswer) {
				setDifficultCardsArr((prev) => [...prev, updatedCard.data])
			}
			isLastCard ? setPracticeMode(false) : setCurrCardPos((prev) => prev + 1)
		} catch (error) {
			console.error('Error reviewing flashcard:', error)
		}
	}

	return (
		<>
			<h1>Practice</h1>
			<div className="grid practice-grid">
				<article className="grid">
					<div>
						<h2>
							{todaysCardsArr.length} <small>cards</small>
						</h2>
						<p>to review today</p>
						<button onClick={() => handleStartPractice(todaysCardsArr)} disabled={todaysCardsArr.length <= 0}>
							practice
						</button>
						<button onClick={() => handleSeeCards(todaysCardsArr)} disabled={todaysCardsArr.length <= 0}>
							see cards
						</button>
					</div>
					<div>
						<h2>{difficultCardsArr.length} ⚡️</h2>
						<p>difficult cards</p>
						<button onClick={() => handleStartPractice(difficultCardsArr)} disabled={difficultCardsArr.length <= 0}>
							practice
						</button>
						<button onClick={() => handleSeeCards(difficultCardsArr)} disabled={difficultCardsArr.length <= 0}>
							see cards
						</button>
					</div>
				</article>
				<article>
					<h2>{retiredArr.length} 👴🏻</h2>
					<p>retired cards</p>
					<button onClick={() => handleStartPractice(retiredArr)} disabled={retiredArr.length <= 0}>
						practice
					</button>
					<button onClick={() => handleSeeCards(retiredArr)} disabled={retiredArr.length <= 0}>
						see cards
					</button>
				</article>
			</div>
			<div>
				{practiceArr.length > 0 && !practiceMode ? (
					<table>
						<thead>
							<tr>
								<th>Content</th>
								<th>Tags</th>
								<th>Difficult?</th>
								<th>Retired</th>
							</tr>
						</thead>
						<tbody>
							{practiceArr.map((elem) => (
								<tr key={elem._id}>
									<td>{elem.content_front}</td>
									<td>
										<ul className="list-unstyled list-horizontal list-tags">
											{elem.tags.map((e) => (
												<li>
													<Pill data={{ type: 'default', name: e.name }} />
												</li>
											))}
										</ul>
									</td>
									<td>{elem.difficult ? '⚡️' : null}</td>
									<td>{elem.retired ? '👴🏻' : null}</td>
								</tr>
							))}
						</tbody>
					</table>
				) : null}
			</div>
			{practiceMode ? (
				<ModalProvider>
					<Modal
						modalIsOpen={practiceMode}
						onCancel={() => (setPracticeMode(false), setPracticeArr([]))}
						description={
							<>
								<h1>
									<Status label="card" currNum={currCardPos + 1} total={practiceArr.length} />
								</h1>
								<Flashcard id={currCard._id} content={currCard} />
								<footer>
									<button
										className="btn-icon btn-danger"
										onClick={() => handleAnswer(false)}
										aria-label="I didn’t know this answer">
										<IconX />
									</button>
									<button
										className="btn-icon btn-success"
										onClick={() => handleAnswer(true)}
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
