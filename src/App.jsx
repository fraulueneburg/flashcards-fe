import '@picocss/pico/css/pico.min.css'
import './scss/styles.scss'

import { Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import { CardsContextWrapper } from './context/cards.context'

import Start from './pages/Start'
import AllCards from './pages/AllCards'
import Practice from './pages/Practice'

function App() {
	return (
		<>
			<>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route path="/" element={<Start />}></Route>
						{/* <Route
							path="/auth/profile"
							element={
								<PrivatePage>
									<UserSettings />
								</PrivatePage>
							}
						/>
						<Route path="/profile-deleted" element={<ProfileDeleted />}></Route> */}
						<Route
							path="/all-cards"
							element={
								<CardsContextWrapper>
									<AllCards />
								</CardsContextWrapper>
							}
						/>
						<Route
							path="/practice"
							element={
								<CardsContextWrapper>
									<Practice />
								</CardsContextWrapper>
							}
						/>
					</Route>
				</Routes>
			</>
		</>
	)
}

export default App
