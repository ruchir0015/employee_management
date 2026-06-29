import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getUsers, deleteUser } from '../services/api'

export default function Users() {
  const navigate = useNavigate()
  const role     = localStorage.getItem('role')

  useEffect(() => {
    if (role !== 'admin') navigate('/dashboard', { replace: true })
  }, [role, navigate])

  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const avatarColors = ['#4285F4', '#EA4335', '#34A853', '#FBBC05']

  async function fetchUsers() {
    setLoading(true); setError('')
    try {
      const res = await getUsers()
      setUsers(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleDelete(id) {
    setError(''); setSuccess('')
    try {
      await deleteUser(id)
      setSuccess('User removed.')
      setConfirmId(null)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.')
      setConfirmId(null)
    }
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">All registered accounts</p>
          </div>
          <span className="badge badge-admin">Admin only</span>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="empty-state">
            <div className="spinner spinner-blue" style={{ width: 36, height: 36 }} />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3>No users found</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const initial = u.username.charAt(0).toUpperCase()
                  const color   = avatarColors[i % 4]
                  return (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--clr-text-dim)', fontSize: '0.8rem' }}>{i + 1}</td>
                      <td>
                        <div className="avatar-cell">
                          <div className="avatar" style={{ background: color }}>{initial}</div>
                          <div className="name">{u.username}</div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{u.email || '—'}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td>
                        <button className="btn btn-danger btn-icon" title="Remove user" onClick={() => setConfirmId(u.id)}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirm */}
        {confirmId && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmId(null)}>
            <div className="modal" style={{ maxWidth: 360 }}>
              <div className="modal-header">
                <h2 className="modal-title">Remove user?</h2>
                <button className="modal-close" onClick={() => setConfirmId(null)}>✕</button>
              </div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>
                This will permanently remove the user account.
              </p>
              <div className="modal-actions">
                <button className="btn btn-ghost" style={{ borderRadius: 8 }} onClick={() => setConfirmId(null)}>Cancel</button>
                <button id="confirm-user-delete" className="btn btn-danger" style={{ borderRadius: 8 }} onClick={() => handleDelete(confirmId)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
