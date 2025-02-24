import { Outlet } from 'react-router-dom'
import Header from '../components/organisms/Header'

export default function Layout() {
	return (
		<>
			<Header />
			<main>
				<Outlet />
			</main>
		</>
	)
}
