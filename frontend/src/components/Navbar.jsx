import { NavLink, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Overview' },
  { to: '/employees', icon: '⊙', label: 'Employees' },
  { to: '/profile',   icon: '◯', label: 'My Profile' },
]

const ADMIN_NAV = [
  { to: '/users', icon: '⬡', label: 'Users' },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const username  = localStorage.getItem('username') || 'User'
  const role      = localStorage.getItem('role') || 'employee'
  const isAdmin   = role === 'admin'
  const initial   = username.charAt(0).toUpperCase()

  // Pick avatar color based on username char
  const colors = ['', 'green', 'red', 'yellow']
  const colorIdx = username.charCodeAt(0) % 4
  const avatarClass = `user-avatar ${colors[colorIdx]}`

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-dots">
          <span /><span /><span /><span />
        </div>
        <h1>Employee<span>Hub</span></h1>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Main</span>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-dot" />
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <span className="nav-section-label" style={{ marginTop: 8 }}>Admin</span>
            {ADMIN_NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-dot" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className={avatarClass}>{initial}</div>
          <div className="user-details">
            <p>{username}</p>
            <span>{role}</span>
          </div>
        </div>
        <button
          id="logout-btn"
          className="btn btn-ghost btn-full"
          onClick={handleLogout}
          style={{ fontSize: '0.82rem' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
