import { useState } from 'react'

export default function EmployeeForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    first_name:  initial.first_name  || '',
    last_name:   initial.last_name   || '',
    email:       initial.email       || '',
    department:  initial.department  || '',
    salary:      initial.salary      || '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'Required'
    if (!form.last_name.trim())  e.last_name  = 'Required'
    if (!form.email.trim())      e.email      = 'Required'
    if (!form.department.trim()) e.department = 'Required'
    if (!form.salary || Number(form.salary) <= 0) e.salary = 'Must be positive'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const err = (field) => errors[field]
    ? <p style={{ color: 'var(--g-red-dark)', fontSize: '0.75rem', marginTop: 3 }}>{errors[field]}</p>
    : null

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input id="emp-first-name" className="form-control" name="first_name"
            value={form.first_name} onChange={handleChange} placeholder="John" />
          {err('first_name')}
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input id="emp-last-name" className="form-control" name="last_name"
            value={form.last_name} onChange={handleChange} placeholder="Smith" />
          {err('last_name')}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input id="emp-email" className="form-control" name="email" type="email"
          value={form.email} onChange={handleChange} placeholder="john@company.com" />
        {err('email')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Department</label>
          <select id="emp-department" className="form-control" name="department"
            value={form.department} onChange={handleChange}>
            <option value="">Select</option>
            {['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Legal', 'Design'].map(d =>
              <option key={d} value={d}>{d}</option>
            )}
          </select>
          {err('department')}
        </div>
        <div className="form-group">
          <label className="form-label">Salary ($)</label>
          <input id="emp-salary" className="form-control" name="salary" type="number" min="1"
            value={form.salary} onChange={handleChange} placeholder="50000" />
          {err('salary')}
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} style={{ borderRadius: 8 }}>
          Cancel
        </button>
        <button id="emp-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ borderRadius: 8 }}>
          {loading ? <span className="spinner" /> : 'Save'}
        </button>
      </div>
    </form>
  )
}
