import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getMe } from '../services/api'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const username = localStorage.getItem('username') || 'User'
  const role     = localStorage.getItem('role')     || 'employee'
  const initial  = username.charAt(0).toUpperCase()

  const avatarColors = { a: '#4285F4', b: '#EA4335', c: '#34A853', d: '#FBBC05' }
  const avatarBg = Object.values(avatarColors)[username.charCodeAt(0) % 4] || '#4285F4'

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getMe()
        setProfile(res.data)
      } catch (_) {
        setError('Could not load profile data.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Your account information</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="empty-state">
            <div className="spinner spinner-blue" style={{ width: 36, height: 36 }} />
          </div>
        ) : (
          <div className="profile-grid">
            {/* Avatar card */}
            <div className="profile-avatar-card">
              <div className="profile-avatar" style={{ background: avatarBg }}>{initial}</div>
              <div>
                <p className="profile-name">{profile?.username ?? username}</p>
                <p className="profile-sub">{profile?.email ?? '—'}</p>
              </div>
              <span className={`badge badge-${role}`}>{role}</span>
            </div>

            {/* Details */}
            <div className="card">
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Account details
              </p>
              <div className="color-bar" style={{ marginBottom: 16 }}>
                <span /><span /><span /><span />
              </div>

              <div className="profile-detail-row">
                <div className="profile-detail-icon">👤</div>
                <div>
                  <div className="profile-detail-label">Username</div>
                  <div className="profile-detail-value">{profile?.username ?? username}</div>
                </div>
              </div>

              <div className="profile-detail-row">
                <div className="profile-detail-icon">📧</div>
                <div>
                  <div className="profile-detail-label">Email</div>
                  <div className="profile-detail-value">{profile?.email ?? '—'}</div>
                </div>
              </div>

              <div className="profile-detail-row">
                <div className="profile-detail-icon">🔑</div>
                <div>
                  <div className="profile-detail-label">Role</div>
                  <div className="profile-detail-value" style={{ textTransform: 'capitalize' }}>{role}</div>
                </div>
              </div>

              <div className="profile-detail-row">
                <div className="profile-detail-icon">🆔</div>
                <div>
                  <div className="profile-detail-label">User ID</div>
                  <div className="profile-detail-value">{profile?.id ?? '—'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
