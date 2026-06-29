import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getEmployees, getUsers } from '../services/api'

export default function Dashboard() {
  const navigate  = useNavigate()
  const username  = localStorage.getItem('username') || 'User'
  const role      = localStorage.getItem('role') || 'employee'
  const isAdmin   = role === 'admin'

  const [stats, setStats]     = useState({ employees: 0, users: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const empRes    = await getEmployees()
        const employees = empRes.data.length
        let users = 0
        if (isAdmin) {
          const uRes = await getUsers()
          users = uRes.data.length
        }
        setStats({ employees, users })
      } catch (_) {
        // silently ignore
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [isAdmin])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const permissions = [
    { label: 'View Employees',       allowed: true },
    { label: 'View Own Profile',     allowed: true },
    { label: 'Add Employees',        allowed: isAdmin },
    { label: 'Edit Employees',       allowed: isAdmin },
    { label: 'Delete Employees',     allowed: isAdmin },
    { label: 'View All Users',       allowed: isAdmin },
    { label: 'Delete Users',         allowed: isAdmin },
  ]

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{greeting}, {username}</h1>
            <p className="page-subtitle">Here's what's happening today</p>
          </div>
          <span className={`badge badge-${role}`}>{role}</span>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon-wrap">👥</div>
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{loading ? '—' : stats.employees}</div>
          </div>

          {isAdmin && (
            <div className="stat-card green">
              <div className="stat-icon-wrap">🛡️</div>
              <div className="stat-label">Registered Users</div>
              <div className="stat-value">{loading ? '—' : stats.users}</div>
            </div>
          )}

          <div className="stat-card yellow">
            <div className="stat-icon-wrap">📅</div>
            <div className="stat-label">Date</div>
            <div className="stat-value" style={{ fontSize: '1rem', marginTop: 6, lineHeight: 1.5, fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="stat-card red">
            <div className="stat-icon-wrap">🔑</div>
            <div className="stat-label">Role</div>
            <div className="stat-value" style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>
              {role}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Quick actions
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              id="dash-view-employees"
              className="btn btn-primary"
              style={{ borderRadius: 8 }}
              onClick={() => navigate('/employees')}
            >
              View Employees
            </button>
            <button
              id="dash-view-profile"
              className="btn btn-ghost"
              style={{ borderRadius: 8 }}
              onClick={() => navigate('/profile')}
            >
              My Profile
            </button>
            {isAdmin && (
              <button
                id="dash-view-users"
                className="btn btn-ghost"
                style={{ borderRadius: 8 }}
                onClick={() => navigate('/users')}
              >
                Manage Users
              </button>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="card">
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Your permissions
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {permissions.map((p, i) => (
              <div key={i} className={`perm-item ${p.allowed ? 'allowed' : 'denied'}`}>
                <span>{p.allowed ? '✓' : '—'}</span>
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
