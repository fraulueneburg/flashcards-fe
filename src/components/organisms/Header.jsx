import { NavLink } from 'react-router-dom'

function Header() {
	return (
		<>
			<header className="site-header">
				<nav>
					<ul>
						<li>
							<NavLink className="logo" to="/cards" end {...({ isActive }) => (isActive ? 'aria-current="page"' : null)}>
								<strong>
									<span aria-hidden="true">⚡️</span> Flashcards
								</strong>
							</NavLink>
						</li>
					</ul>
					<ul className="nav-main">
						<li>
							<NavLink to="/cards" end {...({ isActive }) => (isActive ? 'aria-current="page"' : null)}>
								Cards
							</NavLink>
						</li>
						<li>
							<NavLink to="/practice" end {...({ isActive }) => (isActive ? 'aria-current="page"' : null)}>
								Practice
							</NavLink>
						</li>
					</ul>
				</nav>
			</header>
		</>
	)
}

export default Header
