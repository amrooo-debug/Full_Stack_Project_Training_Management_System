import { useState } from 'react'
import './App.css'

function App() {
  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // UI state
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Logged-in user. We read it from localStorage so a refresh keeps you logged in.
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [fullName, setFullName] = useState(localStorage.getItem('fullName'))

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
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

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

      // Switch to the dashboard
      setRole(data.role)
      setFullName(data.fullName)
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Clears localStorage and returns to the login page
  function handleLogout() {
    localStorage.clear()
    setRole(null)
    setFullName(null)
    setEmail('')
    setPassword('')
  }

  // If we have a role, the user is logged in -> show the dashboard
  if (role) {
    // Pick the dashboard title based on the role
    let title = 'Dashboard'
    if (role === 'ADMIN') title = 'Admin Dashboard'
    else if (role === 'TRAINER') title = 'Trainer Dashboard'
    else if (role === 'TRAINEE') title = 'Trainee Dashboard'

    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">{title}</h1>
          <p>Welcome, {fullName}!</p>
          <button className="login-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    )
  }

  // Otherwise show the login form
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

export default App
