export default function EmployeeCard({ employee, onEdit, onDelete, isAdmin }) {
  const initials = `${employee.first_name?.[0] ?? ''}${employee.last_name?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="user-avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>
          {initials}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {employee.first_name} {employee.last_name}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
            {employee.email}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span className="badge badge-admin">🏢 {employee.department}</span>
        <span className="badge badge-employee">💰 ${Number(employee.salary).toLocaleString()}</span>
      </div>

      {isAdmin && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            className="btn btn-success"
            onClick={() => onEdit(employee)}
            style={{ flex: 1 }}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete(employee.id)}
            style={{ flex: 1 }}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  )
}
