import { useEffect, useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import EmployeeForm from '../components/EmployeeForm'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/api'

const PAGE_SIZE = 10

export default function Employees() {
  const role    = localStorage.getItem('role') || 'employee'
  const isAdmin = role === 'admin'

  const [employees, setEmployees]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [confirmId, setConfirmId]     = useState(null)
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)

  async function fetchEmployees() {
    setLoading(true); setError('')
    try {
      const res = await getEmployees()
      setEmployees(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEmployees() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return employees.filter(e =>
      `${e.first_name} ${e.last_name} ${e.email ?? ''} ${e.department}`.toLowerCase().includes(q)
    )
  }, [employees, search])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  async function handleSubmit(data) {
    setFormLoading(true); setError(''); setSuccess('')
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => fd.append(k, v))
      if (editing) {
        await updateEmployee(editing.id, fd)
        setSuccess('Employee updated.')
      } else {
        await createEmployee(fd)
        setSuccess('Employee added.')
      }
      setShowModal(false); setEditing(null)
      fetchEmployees()
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id) {
    setError(''); setSuccess('')
    try {
      await deleteEmployee(id)
      setSuccess('Employee removed.')
      setConfirmId(null)
      fetchEmployees()
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.')
      setConfirmId(null)
    }
  }

  // Avatar color cycling
  const avatarColors = ['#4285F4', '#EA4335', '#34A853', '#FBBC05']

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button id="add-employee-btn" className="btn btn-primary" style={{ borderRadius: 8 }} onClick={() => { setEditing(null); setShowModal(true) }}>
              Add employee
            </button>
          )}
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Search */}
        <div className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="employee-search"
              className="search-input"
              placeholder="Search employees…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-state">
            <div className="spinner spinner-blue" style={{ width: 36, height: 36 }} />
            <p style={{ marginTop: 12, color: 'var(--clr-text-muted)' }}>Loading…</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3>No employees found</h3>
            <p>{search ? 'Try a different search term.' : 'Add your first employee to get started.'}</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Salary</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((emp, i) => {
                    const initials = `${emp.first_name?.[0] ?? ''}${emp.last_name?.[0] ?? ''}`.toUpperCase()
                    const color    = avatarColors[(emp.id - 1) % 4]
                    return (
                      <tr key={emp.id}>
                        <td style={{ color: 'var(--clr-text-dim)', fontSize: '0.8rem' }}>
                          {(currentPage - 1) * PAGE_SIZE + i + 1}
                        </td>
                        <td>
                          <div className="avatar-cell">
                            <div className="avatar" style={{ background: color }}>{initials}</div>
                            <div>
                              <div className="name">{emp.first_name} {emp.last_name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--clr-text-muted)' }}>{emp.email || '—'}</td>
                        <td><span className="badge badge-dept">{emp.department}</span></td>
                        <td style={{ fontWeight: 600, color: 'var(--clr-text)' }}>
                          ${Number(emp.salary).toLocaleString()}
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="td-actions">
                              <button className="btn btn-success btn-icon" title="Edit" onClick={() => { setEditing(emp); setShowModal(true) }}>
                                ✎
                              </button>
                              <button className="btn btn-danger btn-icon" title="Delete" onClick={() => setConfirmId(emp.id)}>
                                ✕
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn${n === currentPage ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}

        {/* Add / Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">{editing ? 'Edit employee' : 'Add employee'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <EmployeeForm initial={editing || {}} onSubmit={handleSubmit} onCancel={() => setShowModal(false)} loading={formLoading} />
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {confirmId && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmId(null)}>
            <div className="modal" style={{ maxWidth: 360 }}>
              <div className="modal-header">
                <h2 className="modal-title">Remove employee?</h2>
                <button className="modal-close" onClick={() => setConfirmId(null)}>✕</button>
              </div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>
                This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button className="btn btn-ghost" style={{ borderRadius: 8 }} onClick={() => setConfirmId(null)}>Cancel</button>
                <button id="confirm-delete-btn" className="btn btn-danger" style={{ borderRadius: 8 }} onClick={() => handleDelete(confirmId)}>
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
