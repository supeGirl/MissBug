const {Link,NavLink} = ReactRouterDOM
const {useEffect, useState} = React
const {useNavigate} = ReactRouter

import {userService} from '../services/user.service.js'
import {UserMsg} from './UserMsg.jsx'
import { LoginSignup } from './LoginSignup.jsx'
import { UserDetails } from './UserDetails.jsx'


export function AppHeader() {
  const navigate = useNavigate()
  const [user, setUser] = useState(userService.getLoggedinUser())

  useEffect(() => {


  }, [])

  function onLogout() {
    userService
      .logout()
      .then(() => onSetUser(null))
      .catch((err) => showErrorMsg('OOPs try again'))
  }

  function onSetUser(user) {
    setUser(user)
    navigate('/')
  }

  return (
    <header className="nav-bar-container ">
      <UserMsg />
      <nav>
        <NavLink to="/">Home</NavLink> |<NavLink to="/bug">Bugs</NavLink> |<NavLink to="/about">About</NavLink>
        {user &&  <NavLink to="/user"> | Profile</NavLink>}
        {user && user.isAdmin && <NavLink to="/admin">| Admin</NavLink>}
      </nav>
      <h1>Bugs are Forever</h1>
      {user ? (
				<section>
					<Link to={`/user/${user._id}`}>Hello {user.fullname}</Link>
					<button onClick={onLogout}>Logout</button>
				</section>
        
			) : (
				<section>
					<LoginSignup onSetUser={onSetUser} />
				</section>
			)}
    </header>
  )
}
