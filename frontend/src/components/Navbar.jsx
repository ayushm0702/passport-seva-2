import { NavLink, Link, useNavigate } from 'react-router-dom';
import Lotus from './Lotus.jsx';
import { useAuth } from '../context/AuthContext.jsx';
export default function Navbar() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  const home = { citizen: '/dashboard', admin: '/admin', officer: '/officer' }[user?.role];
  return (<>
    <div className="tri" />
    <header className="nav"><div className="in">
      <Link to="/" className="brand"><Lotus size={38} />Passport Seva Portal</Link>
      <nav className="links" aria-label="Main">
        <NavLink to="/" end>Home</NavLink><NavLink to="/about">About</NavLink><NavLink to="/contact">Help</NavLink>
        {user ? (<>
          <NavLink to={home}>Dashboard</NavLink>
          {user.role === 'citizen' && <><NavLink to="/track">Track</NavLink><NavLink to="/profile">Profile</NavLink></>}
          <button onClick={() => { logout(); nav('/'); }}>Log out</button>
        </>) : (<>
          <NavLink to="/login">Log in</NavLink><NavLink to="/register">Register</NavLink><NavLink to="/staff-login">Staff</NavLink>
        </>)}
      </nav>
    </div></header>
  </>);
}
