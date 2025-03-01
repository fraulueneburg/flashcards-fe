import { useState, useEffect, useContext } from 'react'
import { CardsContext } from '../context/cards.context'
import { ModalProvider } from '../context/modal.context'
import Modal from '../components/organisms/Modal'

import Card from '../components/atoms/Card'
import Pill from '../components/atoms/Pill'

function Practice() {
	const { allCardsArr, filteredCardsArr } = useContext(CardsContext)
	const [practiceMode, setPracticeMode] = useState(false)
	const [practiceCardsArr, setPracticeCardsArr] = useState(allCardsArr)

	useEffect(() => {
		const today = new Date()
		today.setHours(23, 59, 59, 999)

		setPracticeCardsArr(allCardsArr.filter((elem) => elem.createdAt <= today.toISOString()))

		console.log('CARD ', allCardsArr[3]?.createdAt)
		console.log('TODAY', today.toISOString())
		console.log('CARD > TODAY?', allCardsArr[3]?.createdAt <= today.toISOString())
	}, [allCardsArr])

	return (
		<>
			<h1>Practice</h1>
			<div className="grid">
				<article>
					<h2>
						{practiceCardsArr.length} <small>cards to review today</small>
					</h2>
					<button onClick={() => setPracticeMode(true)}>practice</button>
					<button>see cards</button>
				</article>
				<article>
					<h2>56</h2>
					<p>difficult cards</p>
					<button>practice</button>
					<button>see cards</button>
				</article>
			</div>
			{/* {practiceCardsArr.map((elem) => elem.createdAt)} */}
			{practiceMode ? (
				<ModalProvider>
					{console.log('ZERO', practiceCardsArr[0])}
					<Modal
						modalIsOpen={practiceMode}
						onCancel={() => setPracticeMode(false)}
						description={
							<>
								{practiceCardsArr.length}
								<Card content={practiceCardsArr[0]} />
							</>
						}
					/>
				</ModalProvider>
			) : null}
		</>
	)
}

export default Practice
