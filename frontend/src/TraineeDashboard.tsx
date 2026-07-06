import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from './api'

// ---- Types that match the backend responses ----

type Course = {
  id: number
  title: string
  description: string
}

type Enrollment = {
  id: number
  userId: number
  userFullName: string
  courseId: number
  courseTitle: string
}

type Lesson = {
  id: number
  title: string
  content: string
  courseId: number
}

type Task = {
  id: number
  title: string
  description: string
  courseId: number
  courseTitle: string
}

type Submission = {
  id: number
  answer: string
  submittedAt: string
  taskId: number
  taskTitle: string
  userId: number
  userFullName: string
}

type Feedback = {
  id: number
  comment: string
  givenAt: string
  submissionId: number
  taskId: number
  taskTitle: string
  traineeId: number
  traineeFullName: string
  trainerId: number
  trainerFullName: string
}

type TraineeDashboardProps = {
  fullName: string | null
  onLogout: () => void
}

function TraineeDashboard({ fullName, onLogout }: TraineeDashboardProps) {
  // The logged-in trainee's own id (saved at login). Used for enroll + submit.
  // IMPORTANT: read this inside the component (not at the top of the file), so
  // it is read AFTER login. Reading it at the top of the file would run before
  // login and give 0, breaking enrollments and submissions.
  const userId = Number(localStorage.getItem('id'))

  // ================= Courses =================
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState('')

  // ================= Enrollments =================
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null)
  const [enrollError, setEnrollError] = useState('')

  // The course the trainee is currently viewing (null = none selected)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // ================= Lessons (view only) =================
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [lessonsError, setLessonsError] = useState('')

  // ================= Tasks (view only) =================
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState('')

  // ================= My submissions =================
  // All of this trainee's submissions. We match them to tasks by taskId.
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState('')

  // Submit-work form text, kept per task id (each task has its own box)
  const [newAnswers, setNewAnswers] = useState<{ [taskId: number]: string }>({})
  const [submittingTaskId, setSubmittingTaskId] = useState<number | null>(null)
  const [submitErrors, setSubmitErrors] = useState<{ [taskId: number]: string }>(
    {}
  )

  // Editing an existing submission (one at a time)
  const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(
    null
  )
  const [editAnswer, setEditAnswer] = useState('')
  const [savingSubmission, setSavingSubmission] = useState(false)
  const [submissionSaveError, setSubmissionSaveError] = useState('')

  // ================= Feedback (view only) =================
  const [openFeedbackSubmissionId, setOpenFeedbackSubmissionId] = useState<
    number | null
  >(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  // ================= Load courses + enrollments (once) =================
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
    try {
      const response = await apiGet(`/enrollments/users/${userId}`)
      if (!response.ok) {
        // Not fatal for the page; just leave the list empty
        return
      }
      setEnrollments(await response.json())
    } catch {
      // Ignore: the enroll buttons will simply show "Enroll"
    }
  }

  useEffect(() => {
    loadCourses()
    loadEnrollments()
  }, [])

  // True if the trainee is already enrolled in this course
  function isEnrolled(courseId: number) {
    return enrollments.some((e) => e.courseId === courseId)
  }

  async function handleEnroll(courseId: number) {
    setEnrollError('')
    setEnrollingCourseId(courseId)
    try {
      const response = await apiPost('/enrollments', { userId, courseId })
      if (!response.ok) {
        // 409 = the backend says this trainee is already enrolled
        if (response.status === 409) {
          setEnrollError('You are already enrolled in this course')
          await loadEnrollments() // refresh so the button flips to "Enrolled"
        } else {
          setEnrollError('Could not enroll. Please try again.')
        }
        return
      }
      await loadEnrollments() // refresh so the button shows "Enrolled"
    } catch {
      setEnrollError('Could not reach the server. Please try again.')
    } finally {
      setEnrollingCourseId(null)
    }
  }

  // When a course is selected, load its lessons + tasks + my submissions
  function handleSelectCourse(course: Course) {
    setSelectedCourse(course)
    setEditingSubmissionId(null)
    setOpenFeedbackSubmissionId(null)
    loadLessons(course.id)
    loadTasks(course.id)
    loadMySubmissions()
  }

  // ================= Lessons / Tasks (view only) =================
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

  // Find this trainee's submission for a task (or undefined if none yet)
  function submissionForTask(taskId: number) {
    return mySubmissions.find((s) => s.taskId === taskId)
  }

  // Update the answer text for a single task's submit box
  function setAnswerFor(taskId: number, value: string) {
    setNewAnswers((prev) => ({ ...prev, [taskId]: value }))
  }

  async function handleSubmitWork(taskId: number) {
    const answer = newAnswers[taskId] ?? ''
    if (answer === '') {
      setSubmitErrors((prev) => ({ ...prev, [taskId]: 'Please enter an answer.' }))
      return
    }

    setSubmitErrors((prev) => ({ ...prev, [taskId]: '' }))
    setSubmittingTaskId(taskId)
    try {
      const response = await apiPost(`/tasks/${taskId}/submissions`, {
        userId,
        answer,
      })
      if (!response.ok) {
        setSubmitErrors((prev) => ({
          ...prev,
          [taskId]: 'Could not submit. Please try again.',
        }))
        return
      }
      setAnswerFor(taskId, '') // clear the box
      await loadMySubmissions() // reload so the submission shows
    } catch {
      setSubmitErrors((prev) => ({
        ...prev,
        [taskId]: 'Could not reach the server. Please try again.',
      }))
    } finally {
      setSubmittingTaskId(null)
    }
  }

  function handleStartEditSubmission(submission: Submission) {
    setSubmissionSaveError('')
    setEditingSubmissionId(submission.id)
    setEditAnswer(submission.answer)
  }

  function handleCancelEditSubmission() {
    setEditingSubmissionId(null)
    setSubmissionSaveError('')
  }

  async function handleSaveSubmission(taskId: number, submissionId: number) {
    if (editAnswer === '') {
      setSubmissionSaveError('Please enter an answer.')
      return
    }

    setSubmissionSaveError('')
    setSavingSubmission(true)
    try {
      const response = await apiPut(
        `/tasks/${taskId}/submissions/${submissionId}`,
        { userId, answer: editAnswer }
      )
      if (!response.ok) {
        setSubmissionSaveError('Could not update. Please try again.')
        return
      }
      setEditingSubmissionId(null)
      await loadMySubmissions()
    } catch {
      setSubmissionSaveError('Could not reach the server. Please try again.')
    } finally {
      setSavingSubmission(false)
    }
  }

  // ================= Feedback (view only) =================
  function handleToggleFeedback(submissionId: number) {
    if (openFeedbackSubmissionId === submissionId) {
      setOpenFeedbackSubmissionId(null)
      return
    }
    setOpenFeedbackSubmissionId(submissionId)
    loadFeedback(submissionId)
  }

  async function loadFeedback(submissionId: number) {
    setFeedbackLoading(true)
    setFeedbackError('')
    setFeedback(null)
    try {
      const response = await apiGet(`/submissions/${submissionId}/feedback`)
      // 404 just means there is no feedback yet
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

  // ================= Render =================
  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        {/* ---- Header ---- */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Trainee Dashboard</h1>
            <p className="dashboard-welcome">Welcome, {fullName}!</p>
            <span className="user-role role-TRAINEE">TRAINEE</span>
          </div>
          <button className="login-button" onClick={onLogout}>
            Logout
          </button>
        </div>

        {/* ---- Courses (view + enroll + select) ---- */}
        <h2 className="dashboard-subtitle">Courses</h2>

        {coursesLoading && <p>Loading courses...</p>}
        {coursesError && <p className="login-error">{coursesError}</p>}
        {enrollError && <p className="login-error">{enrollError}</p>}

        {!coursesLoading && !coursesError && (
          <>
            {courses.length === 0 ? (
              <p>No courses yet.</p>
            ) : (
              <ul className="course-list">
                {courses.map((course) => (
                  <li key={course.id} className="course-item">
                    <div className="course-id">#{course.id}</div>
                    <div className="course-title">{course.title}</div>
                    <div className="course-description">{course.description}</div>
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
            <p className="selected-course-note">
              Viewing: <strong>{selectedCourse.title}</strong>
            </p>

            {/* ============ Lessons (read only) ============ */}
            <h2 className="dashboard-subtitle">Lessons</h2>
            {lessonsLoading && <p>Loading lessons...</p>}
            {lessonsError && <p className="login-error">{lessonsError}</p>}
            {!lessonsLoading && !lessonsError && (
              <>
                {lessons.length === 0 ? (
                  <p>No lessons yet.</p>
                ) : (
                  <ul className="course-list">
                    {lessons.map((lesson) => (
                      <li key={lesson.id} className="course-item">
                        <div className="course-id">#{lesson.id}</div>
                        <div className="course-title">{lesson.title}</div>
                        <div className="course-description">{lesson.content}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {/* ============ Tasks + submit work ============ */}
            <h2 className="dashboard-subtitle">Tasks</h2>
            {tasksLoading && <p>Loading tasks...</p>}
            {tasksError && <p className="login-error">{tasksError}</p>}
            {submissionsError && (
              <p className="login-error">{submissionsError}</p>
            )}

            {!tasksLoading && !tasksError && (
              <>
                {tasks.length === 0 ? (
                  <p>No tasks yet.</p>
                ) : (
                  <ul className="course-list">
                    {tasks.map((task) => {
                      const mySubmission = submissionForTask(task.id)
                      return (
                        <li key={task.id} className="course-item">
                          <div className="course-id">#{task.id}</div>
                          <div className="course-title">{task.title}</div>
                          <div className="course-description">
                            {task.description}
                          </div>

                          {/* ---- My submission for this task ---- */}
                          <div className="sub-panel">
                            <h3 className="panel-title">My Submission</h3>

                            {submissionsLoading && <p>Loading...</p>}

                            {!submissionsLoading && !mySubmission && (
                              // No submission yet -> show submit form
                              <>
                                <label className="login-label">
                                  Your answer
                                  <textarea
                                    value={newAnswers[task.id] ?? ''}
                                    onChange={(e) =>
                                      setAnswerFor(task.id, e.target.value)
                                    }
                                    placeholder="Write your answer here"
                                    rows={3}
                                  />
                                </label>
                                {submitErrors[task.id] && (
                                  <p className="login-error">
                                    {submitErrors[task.id]}
                                  </p>
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
                              // Submission exists -> show it (with edit + feedback)
                              <>
                                {editingSubmissionId === mySubmission.id ? (
                                  // Edit mode
                                  <>
                                    <label className="login-label">
                                      Your answer
                                      <textarea
                                        value={editAnswer}
                                        onChange={(e) =>
                                          setEditAnswer(e.target.value)
                                        }
                                        rows={3}
                                      />
                                    </label>
                                    {submissionSaveError && (
                                      <p className="login-error">
                                        {submissionSaveError}
                                      </p>
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
                                  // View mode
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
                                          <p className="login-error">
                                            {feedbackError}
                                          </p>
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
                                          !feedback && <p>No feedback yet</p>}
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
      </div>
    </div>
  )
}

export default TraineeDashboard
