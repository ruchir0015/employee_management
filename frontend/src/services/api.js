import axios from 'axios'

const BASE_URL = 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally – auto logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const registerUser = (data) => api.post('/api/register', data)
export const loginUser    = (data) => api.post('/api/login', data)

// ── Employees ─────────────────────────────────────────────
export const getEmployees     = ()         => api.get('/api/employees')
export const getEmployee      = (id)       => api.get(`/api/employees/${id}`)
export const createEmployee   = (data)     => api.post('/api/employees', data)
export const updateEmployee   = (id, data) => api.put(`/api/employees/${id}`, data)
export const deleteEmployee   = (id)       => api.delete(`/api/employees/${id}`)

// ── Users ─────────────────────────────────────────────────
export const getUsers     = ()   => api.get('/api/users')
export const deleteUser   = (id) => api.delete(`/api/users/${id}`)
export const getMe        = ()   => api.get('/api/me')

export default api
