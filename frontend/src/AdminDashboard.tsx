import { useEffect, useState, type FormEvent } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Course, Enrollment, User, UserRole } from './types'
import DashboardHeader from './components/DashboardHeader'

type AdminDashboardProps = {
    fullName: string | null
    onLogout: () => void
}

async function getErrorMessage(response: Response, fallbackMessage: string) {
    try {
        const contentType = response.headers.get('content-type')

        if (contentType?.includes('application/json')) {
            const data = await response.json()

            if (typeof data === 'string' && data.trim() !== '') {
                return data
            }

            if (typeof data.detail === 'string' && data.detail.trim() !== '') {
                return data.detail
            }

            if (typeof data.message === 'string' && data.message.trim() !== '') {
                return data.message
            }

            if (typeof data.error === 'string' && data.error.trim() !== '') {
                return data.error
            }

            return fallbackMessage
        }

        const text = await response.text()

        if (text.trim() !== '') {
            return text
        }

        return fallbackMessage
    } catch {
        return fallbackMessage
    }
}

function AdminDashboard({ fullName, onLogout }: AdminDashboardProps) {
    // ================= Shared success message =================
    const [successMessage, setSuccessMessage] = useState('')

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

    // Create Enrollment form
    const [newEnrollmentUserId, setNewEnrollmentUserId] = useState('')
    const [newEnrollmentCourseId, setNewEnrollmentCourseId] = useState('')
    const [creatingEnrollment, setCreatingEnrollment] = useState(false)
    const [enrollmentCreateError, setEnrollmentCreateError] = useState('')

    // Delete Enrollment
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
                const message = await getErrorMessage(
                    response,
                    'Could not load courses. Please try again.'
                )
                setError(message)
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
                const message = await getErrorMessage(
                    response,
                    'Could not load users. Please try again.'
                )
                setUsersError(message)
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
                const message = await getErrorMessage(
                    response,
                    'Could not load enrollments. Please try again.'
                )
                setEnrollmentsError(message)
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
        setSuccessMessage('')

        const courseTitle = newTitle.trim()
        const courseDescription = newDescription.trim()

        if (courseTitle === '' || courseDescription === '') {
            setCreateError('Please enter both a title and a description.')
            return
        }

        setCreateError('')
        setCreating(true)

        try {
            const response = await apiPost('/courses', {
                title: courseTitle,
                description: courseDescription,
            })

            if (!response.ok) {
                const message = await getErrorMessage(
                    response,
                    'Could not create the course. Please try again.'
                )
                setCreateError(message)
                return
            }

            setNewTitle('')
            setNewDescription('')
            await loadCourses()
            setSuccessMessage('Course created successfully.')
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

        setSuccessMessage('')
        setDeleteError('')
        setDeletingId(courseId)

        try {
            const response = await apiDelete(`/courses/${courseId}`)

            if (!response.ok) {
                const message = await getErrorMessage(
                    response,
                    'Could not delete the course. Please try again.'
                )
                setDeleteError(message)
                return
            }

            await loadCourses()
            await loadEnrollments()
            setSuccessMessage('Course deleted successfully.')
        } catch {
            setDeleteError('Could not reach the server. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    function handleStartEdit(course: Course) {
        setSuccessMessage('')
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
        setSuccessMessage('')

        const courseTitle = editTitle.trim()
        const courseDescription = editDescription.trim()

        if (courseTitle === '' || courseDescription === '') {
            setSaveError('Please enter both a title and a description.')
            return
        }

        setSaveError('')
        setSaving(true)

        try {
            const response = await apiPut(`/courses/${courseId}`, {
                title: courseTitle,
                description: courseDescription,
            })

            if (!response.ok) {
                const message = await getErrorMessage(
                    response,
                    'Could not update the course. Please try again.'
                )
                setSaveError(message)
                return
            }

            setEditingId(null)
            await loadCourses()
            await loadEnrollments()
            setSuccessMessage('Course updated successfully.')
        } catch {
            setSaveError('Could not reach the server. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    // ================= Users: create / edit / delete =================
    async function handleCreateUser(event: FormEvent) {
        event.preventDefault()
        setSuccessMessage('')

        const userFullName = newUserFullName.trim()
        const userEmail = newUserEmail.trim()
        const userPassword = newUserPassword.trim()

        if (userFullName === '' || userEmail === '' || userPassword === '') {
            setUserCreateError('Please fill in full name, email, and password.')
            return
        }

        setUserCreateError('')
        setCreatingUser(true)

        try {
            const response = await apiPost('/users', {
                fullName: userFullName,
                email: userEmail,
                password: userPassword,
                role: newUserRole,
            })

            if (!response.ok) {
                const message = await getErrorMessage(
                    response,
                    'Could not create the user. Please try again.'
                )
                setUserCreateError(message)
                return
            }

            setNewUserFullName('')
            setNewUserEmail('')
            setNewUserPassword('')
            setNewUserRole('TRAINEE')
            await loadUsers()
            await loadEnrollments()
            setSuccessMessage('User created successfully.')
        } catch {
            setUserCreateError('Could not reach the server. Please try again.')
        } finally {
            setCreatingUser(false)
        }
    }

    function handleStartEditUser(user: User) {
        setSuccessMessage('')
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
        setSuccessMessage('')

        const userFullName = editUserFullName.trim()
        const userEmail = editUserEmail.trim()
        const userPassword = editUserPassword.trim()

        if (userFullName === '' || userEmail === '' || userPassword === '') {
            setUserSaveError('Please fill in full name, email, and password.')
            return
        }

        setUserSaveError('')
        setSavingUser(true)

        try {
            const response = await apiPut(`/users/${userId}`, {
                fullName: userFullName,
                email: userEmail,
                password: userPassword,
                role: editUserRole,
            })

            if (!response.ok) {
                const message = await getErrorMessage(
                    response,
                    'Could not update the user. Please try again.'
                )
                setUserSaveError(message)
                return
            }

            setEditingUserId(null)
            await loadUsers()
            await loadEnrollments()
            setSuccessMessage('User updated successfully.')
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

        setSuccessMessage('')
        setUserDeleteError('')
        setDeletingUserId(userId)

        try {
            const response = await apiDelete(`/users/${userId}`)

            if (!response.ok) {
                const message = await getErrorMessage(
                    response,
                    'Could not delete the user. Please try again.'
                )
                setUserDeleteError(message)
                return
            }

            await loadUsers()
            await loadEnrollments()
            setSuccessMessage('User deleted successfully.')
        } catch {
            setUserDeleteError('Could not reach the server. Please try again.')
        } finally {
            setDeletingUserId(null)
        }
    }

    // ================= Enrollments: create / delete =================
    async function handleCreateEnrollment(event: FormEvent) {
        event.preventDefault()
        setSuccessMessage('')

        if (newEnrollmentUserId === '' || newEnrollmentCourseId === '') {
            setEnrollmentCreateError('Please select both a trainee and a course.')
            return
        }

        setEnrollmentCreateError('')
        setCreatingEnrollment(true)

        const selectedUserId = Number(newEnrollmentUserId)
        const selectedCourseId = Number(newEnrollmentCourseId)

        const alreadyEnrolled = enrollments.some(
            (enrollment) =>
                enrollment.userId === selectedUserId &&
                enrollment.courseId === selectedCourseId
        )

        if (alreadyEnrolled) {
            setEnrollmentCreateError('This trainee is already enrolled in this course.')
            setCreatingEnrollment(false)
            return
        }

        try {
            const response = await apiPost('/enrollments', {
                userId: selectedUserId,
                courseId: selectedCourseId,
            })

            if (!response.ok) {
                const message = await getErrorMessage(
                    response,
                    'Could not create enrollment. Please try again.'
                )
                setEnrollmentCreateError(message)
                return
            }

            setNewEnrollmentUserId('')
            setNewEnrollmentCourseId('')
            await loadEnrollments()
            setSuccessMessage('Enrollment created successfully.')
        } catch {
            setEnrollmentCreateError('Could not reach the server. Please try again.')
        } finally {
            setCreatingEnrollment(false)
        }
    }

    async function handleDeleteEnrollment(enrollmentId: number) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this enrollment?'
        )

        if (!confirmed) {
            return
        }

        setSuccessMessage('')
        setEnrollmentDeleteError('')
        setDeletingEnrollmentId(enrollmentId)

        try {
            const response = await apiDelete(`/enrollments/${enrollmentId}`)

            if (!response.ok) {
                const message = await getErrorMessage(
                    response,
                    'Could not delete enrollment. Please try again.'
                )
                setEnrollmentDeleteError(message)
                return
            }

            await loadEnrollments()
            setSuccessMessage('Enrollment deleted successfully.')
        } catch {
            setEnrollmentDeleteError('Could not reach the server. Please try again.')
        } finally {
            setDeletingEnrollmentId(null)
        }
    }

    const traineeUsers = users.filter((user) => user.role === 'TRAINEE')
    const trainerUsers = users.filter((user) => user.role === 'TRAINER')

    const totalCourses = courses.length
    const totalUsers = users.length
    const totalEnrollments = enrollments.length
    const totalTrainers = trainerUsers.length
    const totalTrainees = traineeUsers.length

    function getUserDisplayNumber(userId: number) {
        const userIndex = users.findIndex((user) => user.id === userId)
        return userIndex === -1 ? '?' : userIndex + 1
    }

    function getCourseDisplayNumber(courseId: number) {
        const courseIndex = courses.findIndex((course) => course.id === courseId)
        return courseIndex === -1 ? '?' : courseIndex + 1
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

                {successMessage && <p className="success-message">{successMessage}</p>}

                <div className="summary-grid">
                    <div className="summary-card">
                        <span className="summary-label">Courses</span>
                        <strong className="summary-value">{totalCourses}</strong>
                    </div>

                    <div className="summary-card">
                        <span className="summary-label">Users</span>
                        <strong className="summary-value">{totalUsers}</strong>
                    </div>

                    <div className="summary-card">
                        <span className="summary-label">Enrollments</span>
                        <strong className="summary-value">{totalEnrollments}</strong>
                    </div>

                    <div className="summary-card">
                        <span className="summary-label">Trainers</span>
                        <strong className="summary-value">{totalTrainers}</strong>
                    </div>

                    <div className="summary-card">
                        <span className="summary-label">Trainees</span>
                        <strong className="summary-value">{totalTrainees}</strong>
                    </div>
                </div>

                {/* ---- Create Course form ---- */}
                <h2 className="dashboard-subtitle">Create Course</h2>

                <form className="course-form" onSubmit={handleCreateCourse}>
                    <label className="login-label">
                        Title
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(event) => {
                                setNewTitle(event.target.value)
                                setCreateError('')
                                setSuccessMessage('')
                            }}
                            placeholder="e.g. Intro to React"
                        />
                    </label>

                    <label className="login-label">
                        Description
                        <textarea
                            value={newDescription}
                            onChange={(event) => {
                                setNewDescription(event.target.value)
                                setCreateError('')
                                setSuccessMessage('')
                            }}
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
                            <p className="empty-state">
                                No courses yet. Create the first course to get started.
                            </p>
                        ) : (
                            <ul className="course-list">
                                {courses.map((course, courseIndex) => (
                                    <li key={course.id} className="course-item">
                                        <div className="course-id">#{courseIndex + 1}</div>

                                        {editingId === course.id ? (
                                            <>
                                                <label className="login-label">
                                                    Title
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(event) => {
                                                            setEditTitle(event.target.value)
                                                            setSaveError('')
                                                            setSuccessMessage('')
                                                        }}
                                                    />
                                                </label>

                                                <label className="login-label">
                                                    Description
                                                    <textarea
                                                        value={editDescription}
                                                        onChange={(event) => {
                                                            setEditDescription(event.target.value)
                                                            setSaveError('')
                                                            setSuccessMessage('')
                                                        }}
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
                            onChange={(event) => {
                                setNewUserFullName(event.target.value)
                                setUserCreateError('')
                                setSuccessMessage('')
                            }}
                            placeholder="e.g. Jane Trainer"
                        />
                    </label>

                    <label className="login-label">
                        Email
                        <input
                            type="email"
                            value={newUserEmail}
                            onChange={(event) => {
                                setNewUserEmail(event.target.value)
                                setUserCreateError('')
                                setSuccessMessage('')
                            }}
                            placeholder="jane@example.com"
                        />
                    </label>

                    <label className="login-label">
                        Password
                        <input
                            type="password"
                            value={newUserPassword}
                            onChange={(event) => {
                                setNewUserPassword(event.target.value)
                                setUserCreateError('')
                                setSuccessMessage('')
                            }}
                            placeholder="Set an initial password"
                        />
                    </label>

                    <label className="login-label">
                        Role
                        <select
                            value={newUserRole}
                            onChange={(event) => {
                                setNewUserRole(event.target.value as UserRole)
                                setUserCreateError('')
                                setSuccessMessage('')
                            }}
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
                            <p className="empty-state">
                                No users yet. Create the first user to get started.
                            </p>
                        ) : (
                            <ul className="course-list">
                                {users.map((user, userIndex) => (
                                    <li key={user.id} className="course-item">
                                        <div className="course-id">#{userIndex + 1}</div>

                                        {editingUserId === user.id ? (
                                            <>
                                                <label className="login-label">
                                                    Full name
                                                    <input
                                                        type="text"
                                                        value={editUserFullName}
                                                        onChange={(event) => {
                                                            setEditUserFullName(event.target.value)
                                                            setUserSaveError('')
                                                            setSuccessMessage('')
                                                        }}
                                                    />
                                                </label>

                                                <label className="login-label">
                                                    Email
                                                    <input
                                                        type="email"
                                                        value={editUserEmail}
                                                        onChange={(event) => {
                                                            setEditUserEmail(event.target.value)
                                                            setUserSaveError('')
                                                            setSuccessMessage('')
                                                        }}
                                                    />
                                                </label>

                                                <label className="login-label">
                                                    New password
                                                    <input
                                                        type="password"
                                                        value={editUserPassword}
                                                        onChange={(event) => {
                                                            setEditUserPassword(event.target.value)
                                                            setUserSaveError('')
                                                            setSuccessMessage('')
                                                        }}
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
                                                        onChange={(event) => {
                                                            setEditUserRole(event.target.value as UserRole)
                                                            setUserSaveError('')
                                                            setSuccessMessage('')
                                                        }}
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

                <h2 className="dashboard-subtitle">Create Enrollment</h2>

                <form className="course-form" onSubmit={handleCreateEnrollment}>
                    <label className="login-label">
                        Trainee
                        <select
                            value={newEnrollmentUserId}
                            onChange={(event) => {
                                setNewEnrollmentUserId(event.target.value)
                                setEnrollmentCreateError('')
                                setSuccessMessage('')
                            }}
                        >
                            <option value="">Select trainee</option>
                            {traineeUsers.map((user, traineeIndex) => (
                                <option key={user.id} value={user.id}>
                                    {user.fullName} - Trainee #{traineeIndex + 1}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="login-label">
                        Course
                        <select
                            value={newEnrollmentCourseId}
                            onChange={(event) => {
                                setNewEnrollmentCourseId(event.target.value)
                                setEnrollmentCreateError('')
                                setSuccessMessage('')
                            }}
                        >
                            <option value="">Select course</option>
                            {courses.map((course, courseIndex) => (
                                <option key={course.id} value={course.id}>
                                    {course.title} - Course #{courseIndex + 1}
                                </option>
                            ))}
                        </select>
                    </label>

                    {enrollmentCreateError && (
                        <p className="login-error">{enrollmentCreateError}</p>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={creatingEnrollment}
                    >
                        {creatingEnrollment ? 'Creating...' : 'Create Enrollment'}
                    </button>
                </form>

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
                            <p className="empty-state">
                                No enrollments yet. Create an enrollment to assign a trainee to a
                                course.
                            </p>
                        ) : (
                            <ul className="course-list">
                                {enrollments.map((enrollment, enrollmentIndex) => (
                                    <li key={enrollment.id} className="course-item">
                                        <div className="course-id">
                                            Enrollment #{enrollmentIndex + 1}
                                        </div>

                                        <div className="course-title">
                                            {enrollment.userFullName ?? 'Unknown trainee'}
                                        </div>

                                        <div className="course-description">
                                            Course: {enrollment.courseTitle ?? 'Unknown course'}
                                        </div>

                                        <div className="course-id">
                                            User #{getUserDisplayNumber(enrollment.userId)} - Course #
                                            {getCourseDisplayNumber(enrollment.courseId)}
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

                <footer className="dashboard-footer">
                    <strong>Training Management System</strong> - Admin Portal
                </footer>
            </div>
        </div>
    )
}

export default AdminDashboard