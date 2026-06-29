import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]           = useState({ username: '', email: '', password: '', role: 'employee' })
  const [errors, setErrors]       = useState({})
  const [serverErr, setServerErr] = useState('')
  const [success, setSuccess]     = useState('')
  const [loading, setLoading]     = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
    setServerErr('')
  }

  function validate() {
    const e = {}
    if (!form.username.trim()) e.username = 'Required'
    if (!form.email.trim())    e.email    = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password)        e.password = 'Required'
    else if (form.password.length < 5) e.password = 'Min 5 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('username', form.username)
      fd.append('email',    form.email)
      fd.append('password', form.password)
      fd.append('role',     form.role)
      await registerUser(fd)
      setSuccess('Account created! Taking you to sign in…')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed.'
      setServerErr(typeof msg === 'string' ? msg : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-deco-red" />
      <div className="auth-deco-green" />

      <div className="auth-box">
        <div className="auth-logo-mark">
          <div className="logo-dots">
            <span /><span /><span /><span />
          </div>
        </div>

        <div className="color-bar">
          <span /><span /><span /><span />
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">to continue to Employee Hub</p>

        {serverErr && <div className="alert alert-error">{serverErr}</div>}
        {success   && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              className="form-control"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
            />
            {errors.username && <p style={{ color: 'var(--g-red-dark)', fontSize: '0.78rem', marginTop: 4 }}>{errors.username}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="form-control"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p style={{ color: 'var(--g-red-dark)', fontSize: '0.78rem', marginTop: 4 }}>{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-control"
              name="password"
              type="password"
              placeholder="Min. 5 characters"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <p style={{ color: 'var(--g-red-dark)', fontSize: '0.78rem', marginTop: 4 }}>{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">Role</label>
            <select
              id="reg-role"
              className="form-control"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 8, borderRadius: 8 }}
          >
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-link-row">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
