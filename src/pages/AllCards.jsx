import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/atoms/Card'
import FormCard from '../components/molecules/FormCard'
import Pill from '../components/atoms/Pill'
import { Plus as IconPlus } from '@phosphor-icons/react'

import { ModalProvider } from '../context/modal.context'
import Modal from '../components/organisms/Modal'

import { CardsContext } from '../context/cards.context'

function AllCards() {
	const { allCardsArr, filteredCardsArr, setFilteredCardsArr, allCollectionsArr } = useContext(CardsContext)
	const [filterElem, setFilterElem] = useState('')
	const [addCardMode, setAddCardMode] = useState('')
	const navigate = useNavigate()

	const handleFilter = (elem) => {
		const isDifferentFilter = elem && filterElem._id !== elem._id

		if (isDifferentFilter) {
			const cardIdsSet = new Set(elem.cards)
			setFilterElem(elem)
			setFilteredCardsArr(allCardsArr.filter((item) => cardIdsSet.has(item._id)))
			navigate(`?tag=${elem.name}`)
		} else {
			setFilterElem('')
			setFilteredCardsArr(allCardsArr)
			navigate('')
		}
	}

	useEffect(() => {
		if (filterElem) {
			const cardIdsSet = new Set(filterElem.cards)
			setFilteredCardsArr(allCardsArr.filter((item) => cardIdsSet.has(item._id)))
		} else {
			setFilteredCardsArr(allCardsArr)
		}
	}, [allCardsArr, filterElem, setFilteredCardsArr])

	return (
		<>
			<div className="page-header">
				<h1>
					All Cards <sup className="num">{filteredCardsArr?.length}</sup>
				</h1>
				<button aria-label="add new card" className="btn-icon" onClick={() => setAddCardMode(true)}>
					<IconPlus />
				</button>
			</div>
			{!allCollectionsArr ? null : (
				<ul className="list-unstyled list-horizontal list-all-collections">
					{allCollectionsArr.map((elem, index) => (
						<li key={elem._id}>
							<Pill
								data={elem}
								type="filter"
								action={() => handleFilter(elem)}
								classes={filterElem && filterElem._id !== elem._id ? 'inactive' : null}
							/>
						</li>
					))}
				</ul>
			)}
			{!filteredCardsArr ? (
				<p>There are no cards to display</p>
			) : (
				<ul className="list-cards">
					{filteredCardsArr.map((elem) => (
						<li key={elem._id}>
							<Card id={elem._id} content={elem} />
						</li>
					))}
				</ul>
			)}
			{addCardMode ? (
				<ModalProvider>
					<Modal
						modalIsOpen={addCardMode}
						onCancel={() => setAddCardMode(false)}
						description={
							<>
								<FormCard onSubmitFunction={() => setAddCardMode(false)} />
							</>
						}
					/>
				</ModalProvider>
			) : null}
		</>
	)
}

export default AllCards
