import axios from 'axios'
import { API_URL } from '../config'
import { createContext, useEffect, useState } from 'react'

const CardsContext = createContext()

const CardsContextWrapper = ({ children }) => {
	const [allCardsArr, setAllCardsArr] = useState([])
	const [filteredCardsArr, setFilteredCardsArr] = useState(allCardsArr)
	const [allCollectionsArr, setAllCollectionsArr] = useState([])
	const defaultIconWeight = 'regular'

	const fetchCollectionsData = async () => {
		try {
			const resp = await axios.get(`${API_URL}/collections/all`)
			setAllCollectionsArr(
				resp.data.sort(function (a, b) {
					if (a.name.toLowerCase() < b.name.toLowerCase()) {
						return -1
					}
					if (a.name.toLowerCase() > b.name.toLowerCase()) {
						return 1
					}
					return 0
				})
			)
		} catch (err) {
			console.log('Error while loading cards data:', err)
		}
	}

	useEffect(() => {
		const cardSource = axios.CancelToken.source()
		const collectionsSource = axios.CancelToken.source()

		const fetchCardData = async () => {
			try {
				const resp = await axios.get(`${API_URL}/cards/all`)
				const data = resp.data.reverse()
				setAllCardsArr(data)
				setFilteredCardsArr(data)
			} catch (err) {
				console.log('Error while loading cards data:', err)
			}
		}

		fetchCardData()
		fetchCollectionsData()

		return () => {
			cardSource.cancel('Card data fetch canceled by cleanup function.')
			collectionsSource.cancel('Collections data fetch canceled by cleanup function.')
		}
	}, [])

	return (
		<CardsContext.Provider
			value={{
				allCardsArr,
				setAllCardsArr,
				filteredCardsArr,
				setFilteredCardsArr,
				allCollectionsArr,
				setAllCollectionsArr,
				fetchCollectionsData,
				defaultIconWeight,
			}}>
			{children}
		</CardsContext.Provider>
	)
}

export { CardsContext, CardsContextWrapper }
