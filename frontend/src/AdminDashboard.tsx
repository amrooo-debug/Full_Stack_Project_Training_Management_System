import { useEffect, useState, type FormEvent } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Course, Enrollment, User, UserRole } from './types'
import DashboardHeader from './components/DashboardHeader'

type AdminDashboardProps = {
  fullName: string | null
  onLogout: () => void
}

function AdminDashboard({ fullName, onLogout }: AdminDashboardProps) {
  // ================= Courses =================
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create Course form
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Delete Course
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')

  // Edit Course
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
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

  // ================= Enrollments =================
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true)
  const [enrollmentsError, setEnrollmentsError] = useState('')
  const [deletingEnrollmentId, setDeletingEnrollmentId] = useState<number | null>(
      null
  )
  const [enrollmentDeleteError, setEnrollmentDeleteError] = useState('')

  // ================= Load data =================
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

  async function loadEnrollments() {
    setEnrollmentsLoading(true)
    setEnrollmentsError('')

    try {
      const response = await apiGet('/enrollments')

      if (!response.ok) {
        setEnrollmentsError('Could not load enrollments. Please try again.')
        return
      }

      const data = await response.json()
      setEnrollments(data)
    } catch {
      setEnrollmentsError('Could not reach the server. Please try again.')
    } finally {
      setEnrollmentsLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
    loadUsers()
    loadEnrollments()
  }, [])

  // ================= Courses: create / edit / delete =================
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
      await loadEnrollments()
    } catch {
      setDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  function handleStartEdit(course: Course) {
    setSaveError('')
    setEditingId(course.id)
    setEditTitle(course.title)
    setEditDescription(course.description)
  }

  function handleCancelEdit() {
    setEditingId(null)
    setSaveError('')
  }

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
      await loadEnrollments()
    } catch {
      setSaveError('Could not reach the server. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ================= Users: create / edit / delete =================
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
      await loadEnrollments()
    } catch {
      setUserCreateError('Could not reach the server. Please try again.')
    } finally {
      setCreatingUser(false)
    }
  }

  function handleStartEditUser(user: User) {
    setUserSaveError('')
    setEditingUserId(user.id)
    setEditUserFullName(user.fullName)
    setEditUserEmail(user.email)
    setEditUserPassword('')
    setEditUserRole(user.role)
  }

  function handleCancelEditUser() {
    setEditingUserId(null)
    setUserSaveError('')
  }

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
      await loadEnrollments()
    } catch {
      setUserSaveError('Could not reach the server. Please try again.')
    } finally {
      setSavingUser(false)
    }
  }

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
      await loadEnrollments()
    } catch {
      setUserDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingUserId(null)
    }
  }

  // ================= Enrollments: delete =================
  async function handleDeleteEnrollment(enrollmentId: number) {
    const confirmed = window.confirm(
        'Are you sure you want to delete this enrollment?'
    )

    if (!confirmed) {
      return
    }

    setEnrollmentDeleteError('')
    setDeletingEnrollmentId(enrollmentId)

    try {
      const response = await apiDelete(`/enrollments/${enrollmentId}`)

      if (!response.ok) {
        setEnrollmentDeleteError('Could not delete enrollment. Please try again.')
        return
      }

      await loadEnrollments()
    } catch {
      setEnrollmentDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingEnrollmentId(null)
    }
  }

  return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <DashboardHeader
              title="Admin Dashboard"
              fullName={fullName}
              role="ADMIN"
              onLogout={onLogout}
          />

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

          {/* ================= Enrollments ================= */}
          <hr className="section-divider" />

          <h2 className="dashboard-subtitle">Enrollments</h2>

          {enrollmentsLoading && <p>Loading enrollments...</p>}
          {enrollmentsError && (
              <p className="login-error">{enrollmentsError}</p>
          )}
          {enrollmentDeleteError && (
              <p className="login-error">{enrollmentDeleteError}</p>
          )}

          {!enrollmentsLoading && !enrollmentsError && (
              <>
                {enrollments.length === 0 ? (
                    <p>No enrollments yet.</p>
                ) : (
                    <ul className="course-list">
                      {enrollments.map((enrollment) => (
                          <li key={enrollment.id} className="course-item">
                            <div className="course-id">Enrollment #{enrollment.id}</div>

                            <div className="course-title">
                              {enrollment.userFullName ?? 'Unknown trainee'}
                            </div>

                            <div className="course-description">
                              Course: {enrollment.courseTitle ?? 'Unknown course'}
                            </div>

                            <div className="course-id">
                              User #{enrollment.userId} - Course #{enrollment.courseId}
                            </div>

                            <div className="course-actions">
                              <button
                                  className="delete-button"
                                  onClick={() => handleDeleteEnrollment(enrollment.id)}
                                  disabled={deletingEnrollmentId === enrollment.id}
                              >
                                {deletingEnrollmentId === enrollment.id
                                    ? 'Deleting...'
                                    : 'Delete Enrollment'}
                              </button>
                            </div>
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