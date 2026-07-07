import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import LoginPage, { dashboardPathForRole } from './LoginPage'
import AdminDashboard from './AdminDashboard'
import TrainerDashboard from './TrainerDashboard'
import TraineeDashboard from './TraineeDashboard'

// A route that only lets the correct role in.
// - Not logged in         -> go to /login
// - Logged in, wrong role  -> go to that user's own dashboard
// - Logged in, right role  -> show the dashboard
function RoleRoute({ role }: { role: string }) {
  const navigate = useNavigate()

  // We read these fresh from localStorage each render.
  const currentRole = localStorage.getItem('role')
  const fullName = localStorage.getItem('fullName')

  // Not logged in at all
  if (!currentRole) {
    return <Navigate to="/login" replace />
  }

  // Logged in but trying to open the wrong dashboard
  if (currentRole !== role) {
    return <Navigate to={dashboardPathForRole(currentRole)} replace />
  }

  // Logout clears everything and returns to the login page
  function handleLogout() {
    localStorage.clear()
    navigate('/login', { replace: true })
  }

  // Show the dashboard that matches this route's role
  if (role === 'ADMIN') {
    return <AdminDashboard fullName={fullName} onLogout={handleLogout} />
  }

  if (role === 'TRAINER') {
    return <TrainerDashboard fullName={fullName} onLogout={handleLogout} />
  }

  return <TraineeDashboard fullName={fullName} onLogout={handleLogout} />
}

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<RoleRoute role="ADMIN" />} />
          <Route path="/trainer" element={<RoleRoute role="TRAINER" />} />
          <Route path="/trainee" element={<RoleRoute role="TRAINEE" />} />

          {/* Anything else, including "/", goes to the login page,
            which will bounce logged-in users to their dashboard. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App