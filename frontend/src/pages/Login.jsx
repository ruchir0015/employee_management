import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('username', form.username)
      fd.append('password', form.password)

      const res = await loginUser(fd)
      const { access_token, role, username } = res.data
      localStorage.setItem('token',    access_token)
      localStorage.setItem('role',     role)
      localStorage.setItem('username', username ?? form.username)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid credentials.'
      setError(typeof msg === 'string' ? msg : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-deco-red" />
      <div className="auth-deco-green" />

      <div className="auth-box">
        {/* Logo mark */}
        <div className="auth-logo-mark">
          <div className="logo-dots">
            <span /><span /><span /><span />
          </div>
        </div>

        <div className="color-bar">
          <span /><span /><span /><span />
        </div>

        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">to continue to Employee Hub</p>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="form-control"
              name="username"
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-control"
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 8, borderRadius: 8 }}
          >
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <div className="auth-link-row">
          No account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}
