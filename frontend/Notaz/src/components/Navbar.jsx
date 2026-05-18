import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Learn',     path: '/learn' },
    { label: 'Practice',  path: '/practice' },
    { label: 'Progress',  path: '/progress' },
    { label: 'Profile',   path: '/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand" onClick={() => navigate('/dashboard')}>
        <span className="navbar__clef">𝄞</span>
        <span className="navbar__name">Notaz</span>
      </div>

      <ul className="navbar__links">
        {links.map((link) => (
          <li key={link.path}>
            <button
              className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <button className="navbar__logout" onClick={handleLogout}>
        Log out
      </button>
    </nav>
  );
}