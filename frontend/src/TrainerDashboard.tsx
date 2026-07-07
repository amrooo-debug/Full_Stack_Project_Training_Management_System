import { useEffect, useState, type FormEvent } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Course, Lesson, Task, Submission, Feedback } from './types'
import DashboardHeader from './components/DashboardHeader'

// Props passed in from App
type TrainerDashboardProps = {
  fullName: string | null
  onLogout: () => void
}

function TrainerDashboard({ fullName, onLogout }: TrainerDashboardProps) {
  // ================= Shared success message =================
  const [successMessage, setSuccessMessage] = useState('')

  // ================= Courses =================
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState('')

  // The course the trainer is currently working inside
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // ================= Lessons =================
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [lessonsError, setLessonsError] = useState('')

  // Create lesson form
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonContent, setNewLessonContent] = useState('')
  const [creatingLesson, setCreatingLesson] = useState(false)
  const [lessonCreateError, setLessonCreateError] = useState('')

  // Edit lesson
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [editLessonTitle, setEditLessonTitle] = useState('')
  const [editLessonContent, setEditLessonContent] = useState('')
  const [savingLesson, setSavingLesson] = useState(false)
  const [lessonSaveError, setLessonSaveError] = useState('')

  // Delete lesson
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null)
  const [lessonDeleteError, setLessonDeleteError] = useState('')

  // ================= Tasks =================
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState('')

  // Create task form
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [creatingTask, setCreatingTask] = useState(false)
  const [taskCreateError, setTaskCreateError] = useState('')

  // Edit task
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [savingTask, setSavingTask] = useState(false)
  const [taskSaveError, setTaskSaveError] = useState('')

  // Delete task
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [taskDeleteError, setTaskDeleteError] = useState('')

  // ================= Submissions =================
  const [openSubmissionsTaskId, setOpenSubmissionsTaskId] = useState<
      number | null
  >(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState('')

  // ================= Feedback =================
  const [openFeedbackSubmissionId, setOpenFeedbackSubmissionId] = useState<
      number | null
  >(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  // Create feedback form
  const [newFeedbackComment, setNewFeedbackComment] = useState('')
  const [creatingFeedback, setCreatingFeedback] = useState(false)
  const [feedbackCreateError, setFeedbackCreateError] = useState('')

  // Edit feedback
  const [editingFeedback, setEditingFeedback] = useState(false)
  const [editFeedbackComment, setEditFeedbackComment] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [feedbackSaveError, setFeedbackSaveError] = useState('')

  // Delete feedback
  const [deletingFeedback, setDeletingFeedback] = useState(false)
  const [feedbackDeleteError, setFeedbackDeleteError] = useState('')

  // ================= Load courses =================
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

  useEffect(() => {
    loadCourses()
  }, [])

  // When a course is selected, load its lessons and tasks
  function handleSelectCourse(course: Course) {
    setSuccessMessage('')
    setSelectedCourse(course)
    setEditingLessonId(null)
    setEditingTaskId(null)
    setOpenSubmissionsTaskId(null)
    setOpenFeedbackSubmissionId(null)
    setSubmissions([])
    setFeedback(null)
    loadLessons(course.id)
    loadTasks(course.id)
  }

  // ================= Lessons: load / create / edit / delete =================

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

  async function handleCreateLesson(event: FormEvent) {
    event.preventDefault()
    setSuccessMessage('')

    if (!selectedCourse) {
      return
    }

    if (newLessonTitle === '' || newLessonContent === '') {
      setLessonCreateError('Please enter both a title and content.')
      return
    }

    setLessonCreateError('')
    setCreatingLesson(true)

    try {
      const response = await apiPost(`/courses/${selectedCourse.id}/lessons`, {
        title: newLessonTitle,
        content: newLessonContent,
      })

      if (!response.ok) {
        setLessonCreateError('Could not create the lesson. Please try again.')
        return
      }

      setNewLessonTitle('')
      setNewLessonContent('')
      await loadLessons(selectedCourse.id)
      setSuccessMessage('Lesson created successfully.')
    } catch {
      setLessonCreateError('Could not reach the server. Please try again.')
    } finally {
      setCreatingLesson(false)
    }
  }

  function handleStartEditLesson(lesson: Lesson) {
    setSuccessMessage('')
    setLessonSaveError('')
    setEditingLessonId(lesson.id)
    setEditLessonTitle(lesson.title)
    setEditLessonContent(lesson.content)
  }

  function handleCancelEditLesson() {
    setEditingLessonId(null)
    setLessonSaveError('')
  }

  async function handleSaveLesson(lessonId: number) {
    setSuccessMessage('')

    if (!selectedCourse) {
      return
    }

    if (editLessonTitle === '' || editLessonContent === '') {
      setLessonSaveError('Please enter both a title and content.')
      return
    }

    setLessonSaveError('')
    setSavingLesson(true)

    try {
      const response = await apiPut(
          `/courses/${selectedCourse.id}/lessons/${lessonId}`,
          {
            title: editLessonTitle,
            content: editLessonContent,
          }
      )

      if (!response.ok) {
        setLessonSaveError('Could not update the lesson. Please try again.')
        return
      }

      setEditingLessonId(null)
      await loadLessons(selectedCourse.id)
      setSuccessMessage('Lesson updated successfully.')
    } catch {
      setLessonSaveError('Could not reach the server. Please try again.')
    } finally {
      setSavingLesson(false)
    }
  }

  async function handleDeleteLesson(lessonId: number) {
    if (!selectedCourse) {
      return
    }

    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return
    }

    setSuccessMessage('')
    setLessonDeleteError('')
    setDeletingLessonId(lessonId)

    try {
      const response = await apiDelete(
          `/courses/${selectedCourse.id}/lessons/${lessonId}`
      )

      if (!response.ok) {
        setLessonDeleteError('Could not delete the lesson. Please try again.')
        return
      }

      await loadLessons(selectedCourse.id)
      setSuccessMessage('Lesson deleted successfully.')
    } catch {
      setLessonDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingLessonId(null)
    }
  }

  // ================= Tasks: load / create / edit / delete =================

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

  async function handleCreateTask(event: FormEvent) {
    event.preventDefault()
    setSuccessMessage('')

    if (!selectedCourse) {
      return
    }

    if (newTaskTitle === '' || newTaskDescription === '') {
      setTaskCreateError('Please enter both a title and a description.')
      return
    }

    setTaskCreateError('')
    setCreatingTask(true)

    try {
      const response = await apiPost(`/courses/${selectedCourse.id}/tasks`, {
        title: newTaskTitle,
        description: newTaskDescription,
      })

      if (!response.ok) {
        setTaskCreateError('Could not create the task. Please try again.')
        return
      }

      setNewTaskTitle('')
      setNewTaskDescription('')
      await loadTasks(selectedCourse.id)
      setSuccessMessage('Task created successfully.')
    } catch {
      setTaskCreateError('Could not reach the server. Please try again.')
    } finally {
      setCreatingTask(false)
    }
  }

  function handleStartEditTask(task: Task) {
    setSuccessMessage('')
    setTaskSaveError('')
    setEditingTaskId(task.id)
    setEditTaskTitle(task.title)
    setEditTaskDescription(task.description)
  }

  function handleCancelEditTask() {
    setEditingTaskId(null)
    setTaskSaveError('')
  }

  async function handleSaveTask(taskId: number) {
    setSuccessMessage('')

    if (!selectedCourse) {
      return
    }

    if (editTaskTitle === '' || editTaskDescription === '') {
      setTaskSaveError('Please enter both a title and a description.')
      return
    }

    setTaskSaveError('')
    setSavingTask(true)

    try {
      const response = await apiPut(
          `/courses/${selectedCourse.id}/tasks/${taskId}`,
          {
            title: editTaskTitle,
            description: editTaskDescription,
          }
      )

      if (!response.ok) {
        setTaskSaveError('Could not update the task. Please try again.')
        return
      }

      setEditingTaskId(null)
      await loadTasks(selectedCourse.id)
      setSuccessMessage('Task updated successfully.')
    } catch {
      setTaskSaveError('Could not reach the server. Please try again.')
    } finally {
      setSavingTask(false)
    }
  }

  async function handleDeleteTask(taskId: number) {
    if (!selectedCourse) {
      return
    }

    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    setSuccessMessage('')
    setTaskDeleteError('')
    setDeletingTaskId(taskId)

    try {
      const response = await apiDelete(
          `/courses/${selectedCourse.id}/tasks/${taskId}`
      )

      if (!response.ok) {
        setTaskDeleteError('Could not delete the task. Please try again.')
        return
      }

      await loadTasks(selectedCourse.id)
      setSuccessMessage('Task deleted successfully.')
    } catch {
      setTaskDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingTaskId(null)
    }
  }

  // ================= Submissions: toggle + load =================

  function handleToggleSubmissions(taskId: number) {
    setSuccessMessage('')

    if (openSubmissionsTaskId === taskId) {
      setOpenSubmissionsTaskId(null)
      setOpenFeedbackSubmissionId(null)
      setSubmissions([])
      setFeedback(null)
      return
    }

    setOpenFeedbackSubmissionId(null)
    setFeedback(null)
    setOpenSubmissionsTaskId(taskId)
    loadSubmissions(taskId)
  }

  async function loadSubmissions(taskId: number) {
    setSubmissionsLoading(true)
    setSubmissionsError('')
    setSubmissions([])

    try {
      const response = await apiGet(`/tasks/${taskId}/submissions`)

      if (!response.ok) {
        setSubmissionsError('Could not load submissions. Please try again.')
        return
      }

      setSubmissions(await response.json())
    } catch {
      setSubmissionsError('Could not reach the server. Please try again.')
    } finally {
      setSubmissionsLoading(false)
    }
  }

  // ================= Feedback: toggle + load / create / edit / delete =================

  function handleToggleFeedback(submissionId: number) {
    setSuccessMessage('')

    if (openFeedbackSubmissionId === submissionId) {
      setOpenFeedbackSubmissionId(null)
      setFeedback(null)
      return
    }

    setEditingFeedback(false)
    setNewFeedbackComment('')
    setFeedbackCreateError('')
    setOpenFeedbackSubmissionId(submissionId)
    loadFeedback(submissionId)
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

  async function handleCreateFeedback(submissionId: number) {
    setSuccessMessage('')

    if (newFeedbackComment === '') {
      setFeedbackCreateError('Please enter a comment.')
      return
    }

    setFeedbackCreateError('')
    setCreatingFeedback(true)

    const trainerId = Number(localStorage.getItem('id'))

    try {
      const response = await apiPost(`/submissions/${submissionId}/feedback`, {
        trainerId,
        comment: newFeedbackComment,
      })

      if (!response.ok) {
        setFeedbackCreateError('Could not create feedback. Please try again.')
        return
      }

      setNewFeedbackComment('')
      await loadFeedback(submissionId)
      setSuccessMessage('Feedback created successfully.')
    } catch {
      setFeedbackCreateError('Could not reach the server. Please try again.')
    } finally {
      setCreatingFeedback(false)
    }
  }

  function handleStartEditFeedback() {
    if (!feedback) {
      return
    }

    setSuccessMessage('')
    setFeedbackSaveError('')
    setEditFeedbackComment(feedback.comment)
    setEditingFeedback(true)
  }

  function handleCancelEditFeedback() {
    setEditingFeedback(false)
    setFeedbackSaveError('')
  }

  async function handleSaveFeedback(submissionId: number, feedbackId: number) {
    setSuccessMessage('')

    if (editFeedbackComment === '') {
      setFeedbackSaveError('Please enter a comment.')
      return
    }

    setFeedbackSaveError('')
    setSavingFeedback(true)

    const trainerId = Number(localStorage.getItem('id'))

    try {
      const response = await apiPut(
          `/submissions/${submissionId}/feedback/${feedbackId}`,
          {
            trainerId,
            comment: editFeedbackComment,
          }
      )

      if (!response.ok) {
        setFeedbackSaveError('Could not update feedback. Please try again.')
        return
      }

      setEditingFeedback(false)
      await loadFeedback(submissionId)
      setSuccessMessage('Feedback updated successfully.')
    } catch {
      setFeedbackSaveError('Could not reach the server. Please try again.')
    } finally {
      setSavingFeedback(false)
    }
  }

  async function handleDeleteFeedback(feedbackId: number, submissionId: number) {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return
    }

    setSuccessMessage('')
    setFeedbackDeleteError('')
    setDeletingFeedback(true)

    try {
      const response = await apiDelete(`/feedback/${feedbackId}`)

      if (!response.ok) {
        setFeedbackDeleteError('Could not delete feedback. Please try again.')
        return
      }

      await loadFeedback(submissionId)
      setSuccessMessage('Feedback deleted successfully.')
    } catch {
      setFeedbackDeleteError('Could not reach the server. Please try again.')
    } finally {
      setDeletingFeedback(false)
    }
  }

  const totalCourses = courses.length
  const totalLessons = lessons.length
  const totalTasks = tasks.length
  const totalSubmissions = submissions.length
  const totalFeedback = feedback ? 1 : 0

  // ================= Render =================
  return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <DashboardHeader
              title="Trainer Dashboard"
              fullName={fullName}
              role="TRAINER"
              onLogout={onLogout}
          />

          {successMessage && (
              <p className="selected-course-note">{successMessage}</p>
          )}

          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Courses</span>
              <strong className="summary-value">{totalCourses}</strong>
            </div>

            <div className="summary-card">
              <span className="summary-label">Lessons</span>
              <strong className="summary-value">{totalLessons}</strong>
            </div>

            <div className="summary-card">
              <span className="summary-label">Tasks</span>
              <strong className="summary-value">{totalTasks}</strong>
            </div>

            <div className="summary-card">
              <span className="summary-label">Submissions</span>
              <strong className="summary-value">{totalSubmissions}</strong>
            </div>

            <div className="summary-card">
              <span className="summary-label">Feedback</span>
              <strong className="summary-value">{totalFeedback}</strong>
            </div>
          </div>

          {/* ---- Courses ---- */}
          <h2 className="dashboard-subtitle">Courses</h2>

          {coursesLoading && <p>Loading courses...</p>}
          {coursesError && <p className="login-error">{coursesError}</p>}

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
                            <div className="course-description">
                              {course.description}
                            </div>

                            <div className="course-actions">
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
                  Managing: <strong>{selectedCourse.title}</strong>
                </p>

                {/* ============ Lessons ============ */}
                <h2 className="dashboard-subtitle">Lessons</h2>

                <form className="course-form" onSubmit={handleCreateLesson}>
                  <label className="login-label">
                    Lesson title
                    <input
                        type="text"
                        value={newLessonTitle}
                        onChange={(event) => setNewLessonTitle(event.target.value)}
                        placeholder="e.g. Components and Props"
                    />
                  </label>

                  <label className="login-label">
                    Lesson content
                    <textarea
                        value={newLessonContent}
                        onChange={(event) => setNewLessonContent(event.target.value)}
                        placeholder="What does this lesson cover?"
                        rows={3}
                    />
                  </label>

                  {lessonCreateError && (
                      <p className="login-error">{lessonCreateError}</p>
                  )}

                  <button
                      type="submit"
                      className="login-button"
                      disabled={creatingLesson}
                  >
                    {creatingLesson ? 'Creating...' : 'Create Lesson'}
                  </button>
                </form>

                {lessonsLoading && <p>Loading lessons...</p>}
                {lessonsError && <p className="login-error">{lessonsError}</p>}
                {lessonDeleteError && (
                    <p className="login-error">{lessonDeleteError}</p>
                )}

                {!lessonsLoading && !lessonsError && (
                    <>
                      {lessons.length === 0 ? (
                          <p>No lessons yet.</p>
                      ) : (
                          <ul className="course-list">
                            {lessons.map((lesson) => (
                                <li key={lesson.id} className="course-item">
                                  <div className="course-id">#{lesson.id}</div>

                                  {editingLessonId === lesson.id ? (
                                      <>
                                        <label className="login-label">
                                          Title
                                          <input
                                              type="text"
                                              value={editLessonTitle}
                                              onChange={(event) =>
                                                  setEditLessonTitle(event.target.value)
                                              }
                                          />
                                        </label>

                                        <label className="login-label">
                                          Content
                                          <textarea
                                              value={editLessonContent}
                                              onChange={(event) =>
                                                  setEditLessonContent(event.target.value)
                                              }
                                              rows={3}
                                          />
                                        </label>

                                        {lessonSaveError && (
                                            <p className="login-error">{lessonSaveError}</p>
                                        )}

                                        <div className="course-actions">
                                          <button
                                              className="login-button"
                                              onClick={() => handleSaveLesson(lesson.id)}
                                              disabled={savingLesson}
                                          >
                                            {savingLesson ? 'Saving...' : 'Save'}
                                          </button>

                                          <button
                                              className="cancel-button"
                                              onClick={handleCancelEditLesson}
                                              disabled={savingLesson}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </>
                                  ) : (
                                      <>
                                        <div className="course-title">{lesson.title}</div>
                                        <div className="course-description">
                                          {lesson.content}
                                        </div>

                                        <div className="course-actions">
                                          <button
                                              className="edit-button"
                                              onClick={() => handleStartEditLesson(lesson)}
                                          >
                                            Edit
                                          </button>

                                          <button
                                              className="delete-button"
                                              onClick={() => handleDeleteLesson(lesson.id)}
                                              disabled={deletingLessonId === lesson.id}
                                          >
                                            {deletingLessonId === lesson.id
                                                ? 'Deleting...'
                                                : 'Delete'}
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

                {/* ============ Tasks ============ */}
                <h2 className="dashboard-subtitle">Tasks</h2>

                <form className="course-form" onSubmit={handleCreateTask}>
                  <label className="login-label">
                    Task title
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(event) => setNewTaskTitle(event.target.value)}
                        placeholder="e.g. Build a login page"
                    />
                  </label>

                  <label className="login-label">
                    Task description
                    <textarea
                        value={newTaskDescription}
                        onChange={(event) =>
                            setNewTaskDescription(event.target.value)
                        }
                        placeholder="What should the trainee do?"
                        rows={3}
                    />
                  </label>

                  {taskCreateError && (
                      <p className="login-error">{taskCreateError}</p>
                  )}

                  <button
                      type="submit"
                      className="login-button"
                      disabled={creatingTask}
                  >
                    {creatingTask ? 'Creating...' : 'Create Task'}
                  </button>
                </form>

                {tasksLoading && <p>Loading tasks...</p>}
                {tasksError && <p className="login-error">{tasksError}</p>}
                {taskDeleteError && <p className="login-error">{taskDeleteError}</p>}

                {!tasksLoading && !tasksError && (
                    <>
                      {tasks.length === 0 ? (
                          <p>No tasks yet.</p>
                      ) : (
                          <ul className="course-list">
                            {tasks.map((task) => (
                                <li key={task.id} className="course-item">
                                  <div className="course-id">#{task.id}</div>

                                  {editingTaskId === task.id ? (
                                      <>
                                        <label className="login-label">
                                          Title
                                          <input
                                              type="text"
                                              value={editTaskTitle}
                                              onChange={(event) =>
                                                  setEditTaskTitle(event.target.value)
                                              }
                                          />
                                        </label>

                                        <label className="login-label">
                                          Description
                                          <textarea
                                              value={editTaskDescription}
                                              onChange={(event) =>
                                                  setEditTaskDescription(event.target.value)
                                              }
                                              rows={3}
                                          />
                                        </label>

                                        {taskSaveError && (
                                            <p className="login-error">{taskSaveError}</p>
                                        )}

                                        <div className="course-actions">
                                          <button
                                              className="login-button"
                                              onClick={() => handleSaveTask(task.id)}
                                              disabled={savingTask}
                                          >
                                            {savingTask ? 'Saving...' : 'Save'}
                                          </button>

                                          <button
                                              className="cancel-button"
                                              onClick={handleCancelEditTask}
                                              disabled={savingTask}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </>
                                  ) : (
                                      <>
                                        <div className="course-title">{task.title}</div>
                                        <div className="course-description">
                                          {task.description}
                                        </div>

                                        <div className="course-actions">
                                          <button
                                              className="edit-button"
                                              onClick={() => handleStartEditTask(task)}
                                          >
                                            Edit
                                          </button>

                                          <button
                                              className="delete-button"
                                              onClick={() => handleDeleteTask(task.id)}
                                              disabled={deletingTaskId === task.id}
                                          >
                                            {deletingTaskId === task.id
                                                ? 'Deleting...'
                                                : 'Delete'}
                                          </button>

                                          <button
                                              className="edit-button"
                                              onClick={() => handleToggleSubmissions(task.id)}
                                          >
                                            {openSubmissionsTaskId === task.id
                                                ? 'Hide Submissions'
                                                : 'View Submissions'}
                                          </button>
                                        </div>
                                      </>
                                  )}

                                  {/* ---- Submissions panel for this task ---- */}
                                  {openSubmissionsTaskId === task.id && (
                                      <div className="sub-panel">
                                        <h3 className="panel-title">Submissions</h3>

                                        {submissionsLoading && <p>Loading submissions...</p>}
                                        {submissionsError && (
                                            <p className="login-error">{submissionsError}</p>
                                        )}

                                        {!submissionsLoading &&
                                            !submissionsError &&
                                            (submissions.length === 0 ? (
                                                <p>No submissions yet</p>
                                            ) : (
                                                <ul className="course-list">
                                                  {submissions.map((submission) => (
                                                      <li
                                                          key={submission.id}
                                                          className="course-item"
                                                      >
                                                        <div className="course-id">
                                                          Submission #{submission.id} - Task #
                                                          {submission.taskId}
                                                        </div>

                                                        <div className="course-title">
                                                          {submission.userFullName} - User #
                                                          {submission.userId}
                                                        </div>

                                                        <div className="course-description">
                                                          {submission.answer}
                                                        </div>

                                                        <div className="course-actions">
                                                          <button
                                                              className="edit-button"
                                                              onClick={() =>
                                                                  handleToggleFeedback(submission.id)
                                                              }
                                                          >
                                                            {openFeedbackSubmissionId ===
                                                            submission.id
                                                                ? 'Hide Feedback'
                                                                : 'View Feedback'}
                                                          </button>
                                                        </div>

                                                        {/* ---- Feedback panel for this submission ---- */}
                                                        {openFeedbackSubmissionId ===
                                                            submission.id && (
                                                                <div className="sub-panel">
                                                                  <h4 className="panel-title">
                                                                    Feedback
                                                                  </h4>

                                                                  {feedbackLoading && (
                                                                      <p>Loading feedback...</p>
                                                                  )}

                                                                  {feedbackError && (
                                                                      <p className="login-error">
                                                                        {feedbackError}
                                                                      </p>
                                                                  )}

                                                                  {feedbackDeleteError && (
                                                                      <p className="login-error">
                                                                        {feedbackDeleteError}
                                                                      </p>
                                                                  )}

                                                                  {!feedbackLoading &&
                                                                      !feedbackError &&
                                                                      feedback && (
                                                                          <>
                                                                            {editingFeedback ? (
                                                                                <>
                                                                                  <label className="login-label">
                                                                                    Comment
                                                                                    <textarea
                                                                                        value={
                                                                                          editFeedbackComment
                                                                                        }
                                                                                        onChange={(event) =>
                                                                                            setEditFeedbackComment(
                                                                                                event.target.value
                                                                                            )
                                                                                        }
                                                                                        rows={3}
                                                                                    />
                                                                                  </label>

                                                                                  {feedbackSaveError && (
                                                                                      <p className="login-error">
                                                                                        {feedbackSaveError}
                                                                                      </p>
                                                                                  )}

                                                                                  <div className="course-actions">
                                                                                    <button
                                                                                        className="login-button"
                                                                                        onClick={() =>
                                                                                            handleSaveFeedback(
                                                                                                submission.id,
                                                                                                feedback.id
                                                                                            )
                                                                                        }
                                                                                        disabled={savingFeedback}
                                                                                    >
                                                                                      {savingFeedback
                                                                                          ? 'Saving...'
                                                                                          : 'Save'}
                                                                                    </button>

                                                                                    <button
                                                                                        className="cancel-button"
                                                                                        onClick={
                                                                                          handleCancelEditFeedback
                                                                                        }
                                                                                        disabled={savingFeedback}
                                                                                    >
                                                                                      Cancel
                                                                                    </button>
                                                                                  </div>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                  <div className="course-description">
                                                                                    {feedback.comment}
                                                                                  </div>

                                                                                  <div className="course-id">
                                                                                    by{' '}
                                                                                    {feedback.trainerFullName}
                                                                                  </div>

                                                                                  <div className="course-actions">
                                                                                    <button
                                                                                        className="edit-button"
                                                                                        onClick={
                                                                                          handleStartEditFeedback
                                                                                        }
                                                                                    >
                                                                                      Edit Feedback
                                                                                    </button>

                                                                                    <button
                                                                                        className="delete-button"
                                                                                        onClick={() =>
                                                                                            handleDeleteFeedback(
                                                                                                feedback.id,
                                                                                                submission.id
                                                                                            )
                                                                                        }
                                                                                        disabled={
                                                                                          deletingFeedback
                                                                                        }
                                                                                    >
                                                                                      {deletingFeedback
                                                                                          ? 'Deleting...'
                                                                                          : 'Delete Feedback'}
                                                                                    </button>
                                                                                  </div>
                                                                                </>
                                                                            )}
                                                                          </>
                                                                      )}

                                                                  {!feedbackLoading &&
                                                                      !feedbackError &&
                                                                      !feedback && (
                                                                          <>
                                                                            <p>No feedback yet</p>

                                                                            <label className="login-label">
                                                                              Comment
                                                                              <textarea
                                                                                  value={newFeedbackComment}
                                                                                  onChange={(event) =>
                                                                                      setNewFeedbackComment(
                                                                                          event.target.value
                                                                                      )
                                                                                  }
                                                                                  placeholder="Write feedback for this submission"
                                                                                  rows={3}
                                                                              />
                                                                            </label>

                                                                            {feedbackCreateError && (
                                                                                <p className="login-error">
                                                                                  {feedbackCreateError}
                                                                                </p>
                                                                            )}

                                                                            <button
                                                                                className="login-button"
                                                                                onClick={() =>
                                                                                    handleCreateFeedback(
                                                                                        submission.id
                                                                                    )
                                                                                }
                                                                                disabled={creatingFeedback}
                                                                            >
                                                                              {creatingFeedback
                                                                                  ? 'Creating...'
                                                                                  : 'Create Feedback'}
                                                                            </button>
                                                                          </>
                                                                      )}
                                                                </div>
                                                            )}
                                                      </li>
                                                  ))}
                                                </ul>
                                            ))}
                                      </div>
                                  )}
                                </li>
                            ))}
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

export default TrainerDashboard