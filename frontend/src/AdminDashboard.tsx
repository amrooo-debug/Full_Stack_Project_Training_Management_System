import { useEffect, useState, type FormEvent } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Course, User, UserRole } from './types'

// Props: the logged-in admin's name + the logout handler.
// We pass these in from App so this component stays focused on courses.
type AdminDashboardProps = {
  fullName: string | null
  onLogout: () => void
}

function AdminDashboard({ fullName, onLogout }: AdminDashboardProps) {
  // The courses we load from the backend
  const [courses, setCourses] = useState<Course[]>([])

  // UI state for the loading text and any error message
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // The "Create Course" form fields
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // UI state for the create form
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Which course is currently being deleted
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')

  // Which course is currently being edited
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // UI state for saving a course edit
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ================= Users =================
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState('')

  // Create User form
  const [newUserFullName, setNewUserFullName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<UserRole>('TRAINEE')
  const [creatingUser, setCreatingUser] = useState(false)
  const [userCreateError, setUserCreateError] = useState('')

  // Edit User form
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editUserFullName, setEditUserFullName] = useState('')
  const [editUserEmail, setEditUserEmail] = useState('')
  const [editUserPassword, setEditUserPassword] = useState('')
  const [editUserRole, setEditUserRole] = useState<UserRole>('TRAINEE')
  const [savingUser, setSavingUser] = useState(false)
  const [userSaveError, setUserSaveError] = useState('')

  // Delete User
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [userDeleteError, setUserDeleteError] = useState('')

  // Loads the course list from the backend.
  async function loadCourses() {
    setLoading(true)
    setError('')

    try {
      const response = await apiGet('/courses')

      if (!response.ok) {
        setError('Could not load courses. Please try again.')
        return
      }

      const data = await response.json()
      setCourses(data)
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loads the user list from the backend.
  async function loadUsers() {
    setUsersLoading(true)
    setUsersError('')

    try {
      const response = await apiGet('/users')

      if (!response.ok) {
        setUsersError('Could not load users. Please try again.')
        return
      }

      const data = await response.json()
      setUsers(data)
    } catch {
      setUsersError('Could not reach the server. Please try again.')
    } finally {
      setUsersLoading(false)
    }
  }

  // Load courses and users once when the dashboard opens.
  useEffect(() => {
    loadCourses()
    loadUsers()
  }, [])

  // Runs when the Create Course form is submitted.
  async function handleCreateCourse(event: FormEvent) {
    event.preventDefault()

    if (newTitle === '' || newDescription === '') {
      setCreateError('Please enter both a title and a description.')
      return
    }

    setCreateError('')
    setCreating(true)

    try {
      const response = await apiPost('/courses', {
        title: newTitle,
        description: newDescription,
      })

      if (!response.ok) {
        setCreateError('Could not create the course. Please try again.')
        return
      }

      setNewTitle('')
      setNewDescription('')
      await loadCourses()
    } catch {
      setCreateError('Could not reach the server. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  // Runs when a course's Delete button is clicked.
  async function handleDeleteCourse(courseId: number) {
    const confirmed = window.confirm('Are you sure you want to delete this course?')

    if (!confirmed) {
      return
    }

    setDeleteError('')
    setDeletingId(courseId)

    try {
      const response = await apiDelete(`/courses/${courseId}`)

      if (!response.ok) {
        setDeleteError('Could not delete the course. Please try again.')
        return
      }

      await loadCourses()
    } catch {
      setDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Switch a course card into edit mode.
  function handleStartEdit(course: Course) {
    setSaveError('')
    setEditingId(course.id)
    setEditTitle(course.title)
    setEditDescription(course.description)
  }

  // Leave course edit mode without saving.
  function handleCancelEdit() {
    setEditingId(null)
    setSaveError('')
  }

  // Save edited course.
  async function handleSaveEdit(courseId: number) {
    if (editTitle === '' || editDescription === '') {
      setSaveError('Please enter both a title and a description.')
      return
    }

    setSaveError('')
    setSaving(true)

    try {
      const response = await apiPut(`/courses/${courseId}`, {
        title: editTitle,
        description: editDescription,
      })

      if (!response.ok) {
        setSaveError('Could not update the course. Please try again.')
        return
      }

      setEditingId(null)
      await loadCourses()
    } catch {
      setSaveError('Could not reach the server. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Runs when the Create User form is submitted.
  async function handleCreateUser(event: FormEvent) {
    event.preventDefault()

    if (
        newUserFullName === '' ||
        newUserEmail === '' ||
        newUserPassword === ''
    ) {
      setUserCreateError('Please fill in full name, email, and password.')
      return
    }

    setUserCreateError('')
    setCreatingUser(true)

    try {
      const response = await apiPost('/users', {
        fullName: newUserFullName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      })

      if (!response.ok) {
        setUserCreateError('Could not create the user. Please try again.')
        return
      }

      setNewUserFullName('')
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserRole('TRAINEE')
      await loadUsers()
    } catch {
      setUserCreateError('Could not reach the server. Please try again.')
    } finally {
      setCreatingUser(false)
    }
  }

  // Switch a user card into edit mode.
  // The password field starts empty because the backend never returns passwords.
  function handleStartEditUser(user: User) {
    setUserSaveError('')
    setEditingUserId(user.id)
    setEditUserFullName(user.fullName)
    setEditUserEmail(user.email)
    setEditUserPassword('')
    setEditUserRole(user.role)
  }

  // Leave user edit mode without saving.
  function handleCancelEditUser() {
    setEditingUserId(null)
    setUserSaveError('')
  }

  // Save edited user.
  // The backend requires a password on update, so admin must type a new password.
  async function handleSaveUser(userId: number) {
    if (
        editUserFullName === '' ||
        editUserEmail === '' ||
        editUserPassword === ''
    ) {
      setUserSaveError('Please fill in full name, email, and password.')
      return
    }

    setUserSaveError('')
    setSavingUser(true)

    try {
      const response = await apiPut(`/users/${userId}`, {
        fullName: editUserFullName,
        email: editUserEmail,
        password: editUserPassword,
        role: editUserRole,
      })

      if (!response.ok) {
        setUserSaveError('Could not update the user. Please try again.')
        return
      }

      setEditingUserId(null)
      await loadUsers()
    } catch {
      setUserSaveError('Could not reach the server. Please try again.')
    } finally {
      setSavingUser(false)
    }
  }

  // Delete user.
  async function handleDeleteUser(userId: number) {
    const confirmed = window.confirm('Are you sure you want to delete this user?')

    if (!confirmed) {
      return
    }

    setUserDeleteError('')
    setDeletingUserId(userId)

    try {
      const response = await apiDelete(`/users/${userId}`)

      if (!response.ok) {
        setUserDeleteError('Could not delete the user. Please try again.')
        return
      }

      await loadUsers()
    } catch {
      setUserDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingUserId(null)
    }
  }

  return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Admin Dashboard</h1>
              <p className="dashboard-welcome">Welcome, {fullName}!</p>
              <span className="user-role role-ADMIN">ADMIN</span>
            </div>

            <button className="login-button" onClick={onLogout}>
              Logout
            </button>
          </div>

          {/* ---- Create Course form ---- */}
          <h2 className="dashboard-subtitle">Create Course</h2>

          <form className="course-form" onSubmit={handleCreateCourse}>
            <label className="login-label">
              Title
              <input
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="e.g. Intro to React"
              />
            </label>

            <label className="login-label">
              Description
              <textarea
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="What is this course about?"
                  rows={3}
              />
            </label>

            {createError && <p className="login-error">{createError}</p>}

            <button type="submit" className="login-button" disabled={creating}>
              {creating ? 'Creating...' : 'Create Course'}
            </button>
          </form>

          {/* ---- Courses list ---- */}
          <h2 className="dashboard-subtitle">Courses</h2>

          {loading && <p>Loading courses...</p>}
          {error && <p className="login-error">{error}</p>}
          {deleteError && <p className="login-error">{deleteError}</p>}

          {!loading && !error && (
              <>
                {courses.length === 0 ? (
                    <p>No courses yet.</p>
                ) : (
                    <ul className="course-list">
                      {courses.map((course) => (
                          <li key={course.id} className="course-item">
                            <div className="course-id">#{course.id}</div>

                            {editingId === course.id ? (
                                <>
                                  <label className="login-label">
                                    Title
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(event) => setEditTitle(event.target.value)}
                                    />
                                  </label>

                                  <label className="login-label">
                                    Description
                                    <textarea
                                        value={editDescription}
                                        onChange={(event) =>
                                            setEditDescription(event.target.value)
                                        }
                                        rows={3}
                                    />
                                  </label>

                                  {saveError && <p className="login-error">{saveError}</p>}

                                  <div className="course-actions">
                                    <button
                                        className="login-button"
                                        onClick={() => handleSaveEdit(course.id)}
                                        disabled={saving}
                                    >
                                      {saving ? 'Saving...' : 'Save'}
                                    </button>

                                    <button
                                        className="cancel-button"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                            ) : (
                                <>
                                  <div className="course-title">{course.title}</div>
                                  <div className="course-description">
                                    {course.description}
                                  </div>

                                  <div className="course-actions">
                                    <button
                                        className="edit-button"
                                        onClick={() => handleStartEdit(course)}
                                    >
                                      Edit
                                    </button>

                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteCourse(course.id)}
                                        disabled={deletingId === course.id}
                                    >
                                      {deletingId === course.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </div>
                                </>
                            )}
                          </li>
                      ))}
                    </ul>
                )}
              </>
          )}

          {/* ================= Users ================= */}
          <hr className="section-divider" />

          {/* ---- Create User form ---- */}
          <h2 className="dashboard-subtitle">Create User</h2>

          <form className="course-form" onSubmit={handleCreateUser}>
            <label className="login-label">
              Full name
              <input
                  type="text"
                  value={newUserFullName}
                  onChange={(event) => setNewUserFullName(event.target.value)}
                  placeholder="e.g. Jane Trainer"
              />
            </label>

            <label className="login-label">
              Email
              <input
                  type="email"
                  value={newUserEmail}
                  onChange={(event) => setNewUserEmail(event.target.value)}
                  placeholder="jane@example.com"
              />
            </label>

            <label className="login-label">
              Password
              <input
                  type="password"
                  value={newUserPassword}
                  onChange={(event) => setNewUserPassword(event.target.value)}
                  placeholder="Set an initial password"
              />
            </label>

            <label className="login-label">
              Role
              <select
                  value={newUserRole}
                  onChange={(event) =>
                      setNewUserRole(event.target.value as UserRole)
                  }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="TRAINER">TRAINER</option>
                <option value="TRAINEE">TRAINEE</option>
              </select>
            </label>

            {userCreateError && <p className="login-error">{userCreateError}</p>}

            <button type="submit" className="login-button" disabled={creatingUser}>
              {creatingUser ? 'Creating...' : 'Create User'}
            </button>
          </form>

          {/* ---- Users list ---- */}
          <h2 className="dashboard-subtitle">Users</h2>

          {usersLoading && <p>Loading users...</p>}
          {usersError && <p className="login-error">{usersError}</p>}
          {userDeleteError && <p className="login-error">{userDeleteError}</p>}

          {!usersLoading && !usersError && (
              <>
                {users.length === 0 ? (
                    <p>No users yet.</p>
                ) : (
                    <ul className="course-list">
                      {users.map((user) => (
                          <li key={user.id} className="course-item">
                            <div className="course-id">#{user.id}</div>

                            {editingUserId === user.id ? (
                                <>
                                  <label className="login-label">
                                    Full name
                                    <input
                                        type="text"
                                        value={editUserFullName}
                                        onChange={(event) =>
                                            setEditUserFullName(event.target.value)
                                        }
                                    />
                                  </label>

                                  <label className="login-label">
                                    Email
                                    <input
                                        type="email"
                                        value={editUserEmail}
                                        onChange={(event) =>
                                            setEditUserEmail(event.target.value)
                                        }
                                    />
                                  </label>

                                  <label className="login-label">
                                    New password
                                    <input
                                        type="password"
                                        value={editUserPassword}
                                        onChange={(event) =>
                                            setEditUserPassword(event.target.value)
                                        }
                                        placeholder="Enter a new password"
                                    />
                                  </label>

                                  <p className="field-hint">
                                    Saving sets the user's password to what you type here.
                                  </p>

                                  <label className="login-label">
                                    Role
                                    <select
                                        value={editUserRole}
                                        onChange={(event) =>
                                            setEditUserRole(event.target.value as UserRole)
                                        }
                                    >
                                      <option value="ADMIN">ADMIN</option>
                                      <option value="TRAINER">TRAINER</option>
                                      <option value="TRAINEE">TRAINEE</option>
                                    </select>
                                  </label>

                                  {userSaveError && (
                                      <p className="login-error">{userSaveError}</p>
                                  )}

                                  <div className="course-actions">
                                    <button
                                        className="login-button"
                                        onClick={() => handleSaveUser(user.id)}
                                        disabled={savingUser}
                                    >
                                      {savingUser ? 'Saving...' : 'Save'}
                                    </button>

                                    <button
                                        className="cancel-button"
                                        onClick={handleCancelEditUser}
                                        disabled={savingUser}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                            ) : (
                                <>
                                  <div className="course-title">{user.fullName}</div>
                                  <div className="course-description">{user.email}</div>

                                  <div className={`user-role role-${user.role}`}>
                                    {user.role}
                                  </div>

                                  <div className="course-actions">
                                    <button
                                        className="edit-button"
                                        onClick={() => handleStartEditUser(user)}
                                    >
                                      Edit
                                    </button>

                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteUser(user.id)}
                                        disabled={deletingUserId === user.id}
                                    >
                                      {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </div>
                                </>
                            )}
                          </li>
                      ))}
                    </ul>
                )}
              </>
          )}
        </div>
      </div>
  )
}

export default AdminDashboard