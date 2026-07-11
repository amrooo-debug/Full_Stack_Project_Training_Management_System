import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from './api'
import type {
    Course,
    Enrollment,
    Lesson,
    Task,
    Submission,
    Feedback,
} from './types'
import DashboardHeader from './components/DashboardHeader'
import SummaryCard from './components/SummaryCard'
import EmptyState from './components/EmptyState'
import MessageBox from './components/MessageBox'

type TraineeDashboardProps = {
    fullName: string | null
    onLogout: () => void
}

function TraineeDashboard({ fullName, onLogout }: TraineeDashboardProps) {
    // The logged-in trainee's own id is saved at login.
    const userId = Number(localStorage.getItem('id'))

    // ================= Shared success message =================
    const [successMessage, setSuccessMessage] = useState('')

    // ================= Courses =================
    const [courses, setCourses] = useState<Course[]>([])
    const [coursesLoading, setCoursesLoading] = useState(true)
    const [coursesError, setCoursesError] = useState('')

    // ================= Enrollments =================
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null)
    const [enrollError, setEnrollError] = useState('')

    // The course the trainee is currently viewing
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

    // ================= Lessons =================
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [lessonsLoading, setLessonsLoading] = useState(false)
    const [lessonsError, setLessonsError] = useState('')

    // ================= Tasks =================
    const [tasks, setTasks] = useState<Task[]>([])
    const [tasksLoading, setTasksLoading] = useState(false)
    const [tasksError, setTasksError] = useState('')

    // ================= My submissions =================
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([])
    const [submissionsLoading, setSubmissionsLoading] = useState(false)
    const [submissionsError, setSubmissionsError] = useState('')

    // Submit-work form text, kept per task id
    const [newAnswers, setNewAnswers] = useState<{ [taskId: number]: string }>({})
    const [submittingTaskId, setSubmittingTaskId] = useState<number | null>(null)
    const [submitErrors, setSubmitErrors] = useState<{ [taskId: number]: string }>(
        {}
    )

    // Editing an existing submission
    const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(
        null
    )
    const [editAnswer, setEditAnswer] = useState('')
    const [savingSubmission, setSavingSubmission] = useState(false)
    const [submissionSaveError, setSubmissionSaveError] = useState('')

    // ================= Feedback =================
    const [openFeedbackSubmissionId, setOpenFeedbackSubmissionId] = useState<
        number | null
    >(null)
    const [feedback, setFeedback] = useState<Feedback | null>(null)
    const [feedbackLoading, setFeedbackLoading] = useState(false)
    const [feedbackError, setFeedbackError] = useState('')

    // ================= Load courses + enrollments =================
    async function loadCourses() {
        setCoursesLoading(true)
        setCoursesError('')

        try {
            const response = await apiGet('/courses')

            if (!response.ok) {
                setCoursesError('Could not load courses. Please try again.')
                return
            }

            setCourses(await response.json())
        } catch {
            setCoursesError('Could not reach the server. Please try again.')
        } finally {
            setCoursesLoading(false)
        }
    }

    async function loadEnrollments() {
        // Read the logged-in id straight from localStorage here so this loader
        // does not close over the render-scoped userId. That keeps the mount
        // effect free of reactive dependencies (the value is the same either way).
        const enrolledUserId = Number(localStorage.getItem('id'))

        try {
            const response = await apiGet(`/enrollments/users/${enrolledUserId}`)

            if (!response.ok) {
                return
            }

            setEnrollments(await response.json())
        } catch {
            // Not fatal. The page can still show the course list.
        }
    }

    useEffect(() => {
        // Load the course list and my enrollments once when the dashboard
        // mounts. The async function lives inside the effect (the pattern React
        // recommends). Promise.all keeps both requests running in parallel,
        // exactly like before, and each loader manages its own loading/error.
        async function loadInitialData() {
            await Promise.all([loadCourses(), loadEnrollments()])
        }

        void loadInitialData()
    }, [])

    // True if the trainee is already enrolled in this course
    function isEnrolled(courseId: number) {
        return enrollments.some((enrollment) => enrollment.courseId === courseId)
    }

    async function handleEnroll(courseId: number) {
        setSuccessMessage('')
        setEnrollError('')
        setEnrollingCourseId(courseId)

        try {
            const response = await apiPost('/enrollments', { userId, courseId })

            if (!response.ok) {
                if (response.status === 409) {
                    setEnrollError('You are already enrolled in this course')
                    await loadEnrollments()
                } else {
                    setEnrollError('Could not enroll. Please try again.')
                }

                return
            }

            await loadEnrollments()
            setSuccessMessage('Enrollment created successfully.')
        } catch {
            setEnrollError('Could not reach the server. Please try again.')
        } finally {
            setEnrollingCourseId(null)
        }
    }

    // When a course is selected, load its lessons, tasks, and my submissions
    function handleSelectCourse(course: Course) {
        setSuccessMessage('')
        setEnrollError('')
        setSelectedCourse(course)
        setEditingSubmissionId(null)
        setOpenFeedbackSubmissionId(null)
        setFeedback(null)
        setLessons([])
        setTasks([])
        setMySubmissions([])
        void loadLessons(course.id)
        void loadTasks(course.id)
        void loadMySubmissions()
    }

    // ================= Lessons / Tasks =================
    async function loadLessons(courseId: number) {
        setLessonsLoading(true)
        setLessonsError('')

        try {
            const response = await apiGet(`/courses/${courseId}/lessons`)

            if (!response.ok) {
                setLessonsError('Could not load lessons. Please try again.')
                return
            }

            setLessons(await response.json())
        } catch {
            setLessonsError('Could not reach the server. Please try again.')
        } finally {
            setLessonsLoading(false)
        }
    }

    async function loadTasks(courseId: number) {
        setTasksLoading(true)
        setTasksError('')

        try {
            const response = await apiGet(`/courses/${courseId}/tasks`)

            if (!response.ok) {
                setTasksError('Could not load tasks. Please try again.')
                return
            }

            setTasks(await response.json())
        } catch {
            setTasksError('Could not reach the server. Please try again.')
        } finally {
            setTasksLoading(false)
        }
    }

    // ================= My submissions: load / submit / edit =================
    async function loadMySubmissions() {
        setSubmissionsLoading(true)
        setSubmissionsError('')

        try {
            const response = await apiGet(`/users/${userId}/submissions`)

            if (!response.ok) {
                setSubmissionsError('Could not load your submissions. Please try again.')
                return
            }

            setMySubmissions(await response.json())
        } catch {
            setSubmissionsError('Could not reach the server. Please try again.')
        } finally {
            setSubmissionsLoading(false)
        }
    }

    function submissionForTask(taskId: number) {
        return mySubmissions.find((submission) => submission.taskId === taskId)
    }

    function setAnswerFor(taskId: number, value: string) {
        setNewAnswers((previousAnswers) => ({
            ...previousAnswers,
            [taskId]: value,
        }))

        setSubmitErrors((previousErrors) => ({
            ...previousErrors,
            [taskId]: '',
        }))

        setSuccessMessage('')
    }

    async function handleSubmitWork(taskId: number) {
        setSuccessMessage('')

        const answer = (newAnswers[taskId] ?? '').trim()

        if (answer === '') {
            setSubmitErrors((previousErrors) => ({
                ...previousErrors,
                [taskId]: 'Please enter an answer.',
            }))

            return
        }

        setSubmitErrors((previousErrors) => ({
            ...previousErrors,
            [taskId]: '',
        }))
        setSubmittingTaskId(taskId)

        try {
            const response = await apiPost(`/tasks/${taskId}/submissions`, {
                userId,
                answer,
            })

            if (!response.ok) {
                setSubmitErrors((previousErrors) => ({
                    ...previousErrors,
                    [taskId]: 'Could not submit. Please try again.',
                }))

                return
            }

            setAnswerFor(taskId, '')
            await loadMySubmissions()
            setSuccessMessage('Submission created successfully.')
        } catch {
            setSubmitErrors((previousErrors) => ({
                ...previousErrors,
                [taskId]: 'Could not reach the server. Please try again.',
            }))
        } finally {
            setSubmittingTaskId(null)
        }
    }

    function handleStartEditSubmission(submission: Submission) {
        setSuccessMessage('')
        setSubmissionSaveError('')
        setEditingSubmissionId(submission.id)
        setEditAnswer(submission.answer)
    }

    function handleCancelEditSubmission() {
        setEditingSubmissionId(null)
        setSubmissionSaveError('')
    }

    async function handleSaveSubmission(taskId: number, submissionId: number) {
        setSuccessMessage('')

        const answer = editAnswer.trim()

        if (answer === '') {
            setSubmissionSaveError('Please enter an answer.')
            return
        }

        setSubmissionSaveError('')
        setSavingSubmission(true)

        try {
            const response = await apiPut(
                `/tasks/${taskId}/submissions/${submissionId}`,
                {
                    userId,
                    answer,
                }
            )

            if (!response.ok) {
                setSubmissionSaveError('Could not update. Please try again.')
                return
            }

            setEditingSubmissionId(null)
            await loadMySubmissions()
            setSuccessMessage('Submission updated successfully.')
        } catch {
            setSubmissionSaveError('Could not reach the server. Please try again.')
        } finally {
            setSavingSubmission(false)
        }
    }

    // ================= Feedback =================
    function handleToggleFeedback(submissionId: number) {
        setSuccessMessage('')

        if (openFeedbackSubmissionId === submissionId) {
            setOpenFeedbackSubmissionId(null)
            setFeedback(null)
            return
        }

        setOpenFeedbackSubmissionId(submissionId)
        void loadFeedback(submissionId)
    }

    async function loadFeedback(submissionId: number) {
        setFeedbackLoading(true)
        setFeedbackError('')
        setFeedback(null)

        try {
            const response = await apiGet(`/submissions/${submissionId}/feedback`)

            if (response.status === 404) {
                setFeedback(null)
                return
            }

            if (!response.ok) {
                setFeedbackError('Could not load feedback. Please try again.')
                return
            }

            setFeedback(await response.json())
        } catch {
            setFeedbackError('Could not reach the server. Please try again.')
        } finally {
            setFeedbackLoading(false)
        }
    }

    const totalCourses = courses.length
    const totalEnrolledCourses = enrollments.length
    const totalLessons = lessons.length
    const totalTasks = tasks.length
    const totalSubmissions = mySubmissions.length

    // ================= Render =================
    return (
        <div className="dashboard-page">
            <div className="dashboard-card">
                <DashboardHeader
                    title="Trainee Dashboard"
                    fullName={fullName}
                    role="TRAINEE"
                    onLogout={onLogout}
                />

                {successMessage && <MessageBox type="success">{successMessage}</MessageBox>}

                <div className="summary-grid">
                    <SummaryCard label="Courses" value={totalCourses} />
                    <SummaryCard label="Enrolled" value={totalEnrolledCourses} />
                    <SummaryCard label="Lessons" value={totalLessons} />
                    <SummaryCard label="Tasks" value={totalTasks} />
                    <SummaryCard label="Submissions" value={totalSubmissions} />
                </div>

                {/* ---- Courses ---- */}
                <h2 className="dashboard-subtitle">Courses</h2>

                {coursesLoading && <p>Loading courses...</p>}
                {coursesError && <MessageBox type="error">{coursesError}</MessageBox>}
                {enrollError && <MessageBox type="error">{enrollError}</MessageBox>}

                {!coursesLoading && !coursesError && (
                    <>
                        {courses.length === 0 ? (
                            <EmptyState>No courses yet. Ask an admin to create a course first.</EmptyState>
                        ) : (
                            <ul className="course-list">
                                {courses.map((course, courseIndex) => (
                                    <li key={course.id} className="course-item">
                                        <div className="course-id">#{courseIndex + 1}</div>
                                        <div className="course-title">{course.title}</div>
                                        <div className="course-description">
                                            {course.description}
                                        </div>

                                        <div className="course-actions">
                                            {isEnrolled(course.id) ? (
                                                <button className="edit-button" disabled>
                                                    Enrolled
                                                </button>
                                            ) : (
                                                <button
                                                    className="login-button"
                                                    onClick={() => handleEnroll(course.id)}
                                                    disabled={enrollingCourseId === course.id}
                                                >
                                                    {enrollingCourseId === course.id
                                                        ? 'Enrolling...'
                                                        : 'Enroll'}
                                                </button>
                                            )}

                                            <button
                                                className="edit-button"
                                                onClick={() => handleSelectCourse(course)}
                                                disabled={selectedCourse?.id === course.id}
                                            >
                                                {selectedCourse?.id === course.id
                                                    ? 'Selected'
                                                    : 'Select Course'}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}

                {/* ---- Everything below only shows once a course is selected ---- */}
                {selectedCourse && (
                    <>
                        <hr className="section-divider" />

                        <div className="selected-course-details">
                            <p className="selected-course-title">
                                Viewing: <strong>{selectedCourse.title}</strong>
                            </p>

                            <div className="selected-course-stats">
                                <span className="selected-course-stat">
                                    Lessons: {totalLessons}
                                </span>
                                <span className="selected-course-stat">
                                    Tasks: {totalTasks}
                                </span>
                                <span className="selected-course-stat">
                                    My Submissions: {totalSubmissions}
                                </span>
                            </div>
                        </div>

                        {/* ============ Lessons ============ */}
                        <h2 className="dashboard-subtitle">Lessons</h2>

                        {lessonsLoading && <p>Loading lessons...</p>}
                        {lessonsError && <MessageBox type="error">{lessonsError}</MessageBox>}

                        {!lessonsLoading && !lessonsError && (
                            <>
                                {lessons.length === 0 ? (
                                    <EmptyState>No lessons yet. The trainer has not added lessons for this course.</EmptyState>
                                ) : (
                                    <ul className="course-list">
                                        {lessons.map((lesson, lessonIndex) => (
                                            <li key={lesson.id} className="course-item">
                                                <div className="course-id">#{lessonIndex + 1}</div>
                                                <div className="course-title">{lesson.title}</div>
                                                <div className="course-description">
                                                    {lesson.content}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}

                        {/* ============ Tasks + submit work ============ */}
                        <h2 className="dashboard-subtitle">Tasks</h2>

                        {tasksLoading && <p>Loading tasks...</p>}
                        {tasksError && <MessageBox type="error">{tasksError}</MessageBox>}
                        {submissionsError && (
                            <MessageBox type="error">{submissionsError}</MessageBox>
                        )}

                        {!tasksLoading && !tasksError && (
                            <>
                                {tasks.length === 0 ? (
                                    <EmptyState>No tasks yet. The trainer has not added tasks for this course.</EmptyState>
                                ) : (
                                    <ul className="course-list">
                                        {tasks.map((task, taskIndex) => {
                                            const mySubmission = submissionForTask(task.id)

                                            return (
                                                <li key={task.id} className="course-item">
                                                    <div className="course-id">#{taskIndex + 1}</div>
                                                    <div className="course-title">{task.title}</div>
                                                    <div className="course-description">
                                                        {task.description}
                                                    </div>

                                                    {/* ---- My submission for this task ---- */}
                                                    <div className="sub-panel">
                                                        <h3 className="panel-title">My Submission</h3>

                                                        {submissionsLoading && <p>Loading...</p>}

                                                        {!submissionsLoading && !mySubmission && (
                                                            <>
                                                                <EmptyState>You have not submitted work for this task yet.</EmptyState>

                                                                <label className="login-label">
                                                                    Your answer
                                                                    <textarea
                                                                        value={newAnswers[task.id] ?? ''}
                                                                        onChange={(event) =>
                                                                            setAnswerFor(task.id, event.target.value)
                                                                        }
                                                                        placeholder="Write your answer here"
                                                                        rows={3}
                                                                    />
                                                                </label>

                                                                {submitErrors[task.id] && (
                                                                    <MessageBox type="error">{submitErrors[task.id]}</MessageBox>
                                                                )}

                                                                <button
                                                                    className="login-button"
                                                                    onClick={() => handleSubmitWork(task.id)}
                                                                    disabled={submittingTaskId === task.id}
                                                                >
                                                                    {submittingTaskId === task.id
                                                                        ? 'Submitting...'
                                                                        : 'Submit Work'}
                                                                </button>
                                                            </>
                                                        )}

                                                        {!submissionsLoading && mySubmission && (
                                                            <>
                                                                {editingSubmissionId === mySubmission.id ? (
                                                                    <>
                                                                        <label className="login-label">
                                                                            Your answer
                                                                            <textarea
                                                                                value={editAnswer}
                                                                                onChange={(event) => {
                                                                                    setEditAnswer(event.target.value)
                                                                                    setSubmissionSaveError('')
                                                                                    setSuccessMessage('')
                                                                                }}
                                                                                rows={3}
                                                                            />
                                                                        </label>

                                                                        {submissionSaveError && (
                                                                            <MessageBox type="error">{submissionSaveError}</MessageBox>
                                                                        )}

                                                                        <div className="course-actions">
                                                                            <button
                                                                                className="login-button"
                                                                                onClick={() =>
                                                                                    handleSaveSubmission(
                                                                                        task.id,
                                                                                        mySubmission.id
                                                                                    )
                                                                                }
                                                                                disabled={savingSubmission}
                                                                            >
                                                                                {savingSubmission ? 'Saving...' : 'Save'}
                                                                            </button>

                                                                            <button
                                                                                className="cancel-button"
                                                                                onClick={handleCancelEditSubmission}
                                                                                disabled={savingSubmission}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="course-description">
                                                                            {mySubmission.answer}
                                                                        </div>

                                                                        <div className="course-actions">
                                                                            <button
                                                                                className="edit-button"
                                                                                onClick={() =>
                                                                                    handleStartEditSubmission(mySubmission)
                                                                                }
                                                                            >
                                                                                Edit Submission
                                                                            </button>

                                                                            <button
                                                                                className="edit-button"
                                                                                onClick={() =>
                                                                                    handleToggleFeedback(mySubmission.id)
                                                                                }
                                                                            >
                                                                                {openFeedbackSubmissionId ===
                                                                                mySubmission.id
                                                                                    ? 'Hide Feedback'
                                                                                    : 'View Feedback'}
                                                                            </button>
                                                                        </div>

                                                                        {/* ---- Feedback panel ---- */}
                                                                        {openFeedbackSubmissionId ===
                                                                            mySubmission.id && (
                                                                                <div className="sub-panel">
                                                                                    <h4 className="panel-title">Feedback</h4>

                                                                                    {feedbackLoading && (
                                                                                        <p>Loading feedback...</p>
                                                                                    )}

                                                                                    {feedbackError && (
                                                                                        <MessageBox type="error">{feedbackError}</MessageBox>
                                                                                    )}

                                                                                    {!feedbackLoading &&
                                                                                        !feedbackError &&
                                                                                        feedback && (
                                                                                            <>
                                                                                                <div className="course-description">
                                                                                                    {feedback.comment}
                                                                                                </div>

                                                                                                <div className="course-id">
                                                                                                    by {feedback.trainerFullName}
                                                                                                </div>
                                                                                            </>
                                                                                        )}

                                                                                    {!feedbackLoading &&
                                                                                        !feedbackError &&
                                                                                        !feedback && (
                                                                                            <EmptyState>No feedback yet. The trainer has not reviewed this submission yet.</EmptyState>
                                                                                        )}
                                                                                </div>
                                                                            )}
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </>
                        )}
                    </>
                )}

                <footer className="dashboard-footer">
                    <strong>Training Management System</strong> - Trainee Portal
                </footer>
            </div>
        </div>
    )
}

export default TraineeDashboard