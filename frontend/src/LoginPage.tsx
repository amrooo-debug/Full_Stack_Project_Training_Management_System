import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from './api'
import './App.css'

// Given a role, return the dashboard path it belongs to.
// Exported so App can reuse it for redirects.
export function dashboardPathForRole(role: string | null) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'TRAINER') return '/trainer'
  if (role === 'TRAINEE') return '/trainee'
  return '/login'
}

function LoginPage() {
  const navigate = useNavigate()

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // UI state
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If the user is already logged in, send them straight to their dashboard.
  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role) {
      navigate(dashboardPathForRole(role), { replace: true })
    }
  }, [navigate])

  // Runs when the Login button is clicked / form is submitted
  async function handleLogin(event: React.FormEvent) {
    event.preventDefault() // stop the page from reloading

    if (email === '' || password === '') {
      setError('Please enter both email and password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await apiPost('/auth/login', { email, password })
      const data = await response.json()

      if (!response.ok) {
        // Show the backend's error message if login fails
        setError(data.message || 'Login failed. Please try again.')
        return
      }

      // Save the values from a successful login
      localStorage.setItem('token', data.token)
      localStorage.setItem('id', String(data.id))
      localStorage.setItem('fullName', data.fullName)
      localStorage.setItem('email', data.email)
      localStorage.setItem('role', data.role)

      // Go to the dashboard that matches the role
      navigate(dashboardPathForRole(data.role), { replace: true })
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1 className="login-title">Training Management System</h1>

        <label className="login-label">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="login-label">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </label>

        {/* Error message area (only shows when there is an error) */}
        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
