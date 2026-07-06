import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'

// The shape of one course coming back from GET /courses
type Course = {
  id: number
  title: string
  description: string
}

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

  // UI state for the create form (its own loading + error)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Which course is currently being deleted (its id), or null if none.
  // We use this to disable + show "Deleting..." on just that one button.
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')

  // Which course is currently being edited (its id), or null if none.
  // When set, that card shows editable fields instead of plain text.
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // UI state for saving an edit (its own loading + error)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Loads the course list from the backend.
  // We keep it as its own function so we can call it again after creating a course.
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

  // Load the courses once, right after this dashboard first shows.
  useEffect(() => {
    loadCourses()
  }, []) // empty [] means: run only once when the component appears

  // Runs when the Create Course form is submitted
  async function handleCreateCourse(event: React.FormEvent) {
    event.preventDefault() // stop the page from reloading

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

      // Success: clear the form...
      setNewTitle('')
      setNewDescription('')

      // ...and reload the list so the new course appears
      await loadCourses()
    } catch {
      setCreateError('Could not reach the server. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  // Runs when a course's Delete button is clicked
  async function handleDeleteCourse(courseId: number) {
    // Ask the browser to confirm before deleting
    const confirmed = window.confirm('Are you sure you want to delete this course?')
    if (!confirmed) {
      return
    }

    setDeleteError('')
    setDeletingId(courseId) // remember which one we're deleting

    try {
      const response = await apiDelete(`/courses/${courseId}`)

      if (!response.ok) {
        setDeleteError('Could not delete the course. Please try again.')
        return
      }

      // Success: reload the list so the deleted course disappears
      await loadCourses()
    } catch {
      setDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Runs when a course's Edit button is clicked.
  // We switch that card into "edit mode" and pre-fill the fields with its current values.
  function handleStartEdit(course: Course) {
    setSaveError('')
    setEditingId(course.id)
    setEditTitle(course.title)
    setEditDescription(course.description)
  }

  // Runs when Cancel is clicked: leave edit mode without saving.
  function handleCancelEdit() {
    setEditingId(null)
    setSaveError('')
  }

  // Runs when Save is clicked: send the updated values with PUT.
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

      // Success: leave edit mode and reload the list to show the new values
      setEditingId(null)
      await loadCourses()
    } catch {
      setSaveError('Could not reach the server. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-welcome">Welcome, {fullName}!</p>
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
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Intro to React"
            />
          </label>

          <label className="login-label">
            Description
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What is this course about?"
              rows={3}
            />
          </label>

          {/* Create error message (only shows when there is an error) */}
          {createError && <p className="login-error">{createError}</p>}

          <button type="submit" className="login-button" disabled={creating}>
            {creating ? 'Creating...' : 'Create Course'}
          </button>
        </form>

        <h2 className="dashboard-subtitle">Courses</h2>

        {/* While loading, show a simple message */}
        {loading && <p>Loading courses...</p>}

        {/* If something went wrong, show the error (in red) */}
        {error && <p className="login-error">{error}</p>}

        {/* Delete error message (only shows when a delete fails) */}
        {deleteError && <p className="login-error">{deleteError}</p>}

        {/* When done loading with no error, show the list */}
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
                      // ---- Edit mode: show editable fields for this course ----
                      <>
                        <label className="login-label">
                          Title
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </label>

                        <label className="login-label">
                          Description
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={3}
                          />
                        </label>

                        {/* Save error message (only shows when a save fails) */}
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
                      // ---- View mode: show the course text + Edit/Delete ----
                      <>
                        <div className="course-title">{course.title}</div>
                        <div className="course-description">{course.description}</div>
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
      </div>
    </div>
  )
}

export default AdminDashboard
