package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.SubmissionRequest
import com.example.trainingmanagementsystem.entity.FeedbackEntity
import com.example.trainingmanagementsystem.entity.SubmissionEntity
import com.example.trainingmanagementsystem.entity.TaskEntity
import com.example.trainingmanagementsystem.entity.UserEntity
import com.example.trainingmanagementsystem.enums.UserRole
import com.example.trainingmanagementsystem.repository.FeedbackRepository
import com.example.trainingmanagementsystem.repository.SubmissionRepository
import com.example.trainingmanagementsystem.repository.TaskRepository
import com.example.trainingmanagementsystem.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.BDDMockito.given
import org.mockito.Mockito.inOrder
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

/**
 * Pure unit tests for SubmissionService. All repositories are mocked, so these
 * tests run without the Spring context and without a database.
 */
class SubmissionServiceTest {

    private val submissionRepository: SubmissionRepository = mock(SubmissionRepository::class.java)
    private val taskRepository: TaskRepository = mock(TaskRepository::class.java)
    private val userRepository: UserRepository = mock(UserRepository::class.java)
    private val feedbackRepository: FeedbackRepository = mock(FeedbackRepository::class.java)

    private val submissionService = SubmissionService(
        submissionRepository,
        taskRepository,
        userRepository,
        feedbackRepository
    )

    private fun traineeUser(id: Long) =
        UserEntity(id = id, fullName = "Trainee", email = "trainee@test.com", role = UserRole.TRAINEE)

    private fun task(id: Long) = TaskEntity(id = id, title = "Task", description = "Description")

    @Test
    fun `createSubmission throws 409 when the user already submitted the task`() {
        given(taskRepository.findById(1L)).willReturn(Optional.of(task(1L)))
        given(userRepository.findById(2L)).willReturn(Optional.of(traineeUser(2L)))
        given(submissionRepository.existsByTaskIdAndUserId(1L, 2L)).willReturn(true)

        val request = SubmissionRequest(userId = 2L, answer = "My answer")

        val exception = assertThrows<ResponseStatusException> {
            submissionService.createSubmission(1L, request)
        }

        assertEquals(HttpStatus.CONFLICT, exception.statusCode)
        // Assert the real production message (see note in the accompanying report).
        assertEquals("User already submitted this task", exception.reason)
    }

    @Test
    fun `createSubmission trims the answer before saving`() {
        given(taskRepository.findById(1L)).willReturn(Optional.of(task(1L)))
        given(userRepository.findById(2L)).willReturn(Optional.of(traineeUser(2L)))
        given(submissionRepository.existsByTaskIdAndUserId(1L, 2L)).willReturn(false)
        given(submissionRepository.save(any(SubmissionEntity::class.java)))
            .willReturn(SubmissionEntity(id = 5, answer = "My answer"))

        val request = SubmissionRequest(userId = 2L, answer = "   My answer   ")
        submissionService.createSubmission(1L, request)

        val savedSubmission = ArgumentCaptor.forClass(SubmissionEntity::class.java)
        verify(submissionRepository).save(savedSubmission.capture())
        assertEquals("My answer", savedSubmission.value.answer)
    }

    @Test
    fun `updateSubmission trims the answer before saving`() {
        val existingSubmission = SubmissionEntity(
            id = 5,
            answer = "Old answer",
            task = task(1L),
            user = traineeUser(2L)
        )
        given(taskRepository.existsById(1L)).willReturn(true)
        given(submissionRepository.findById(5L)).willReturn(Optional.of(existingSubmission))
        given(submissionRepository.save(any(SubmissionEntity::class.java))).willReturn(existingSubmission)

        val request = SubmissionRequest(userId = 2L, answer = "   Updated answer   ")
        submissionService.updateSubmission(1L, 5L, request)

        val savedSubmission = ArgumentCaptor.forClass(SubmissionEntity::class.java)
        verify(submissionRepository).save(savedSubmission.capture())
        assertEquals("Updated answer", savedSubmission.value.answer)
    }

    @Test
    fun `deleteSubmission deletes the linked feedback before deleting the submission`() {
        val submission = SubmissionEntity(id = 5, answer = "My answer")
        val feedback = FeedbackEntity(id = 9, comment = "Nice work", submission = submission)
        given(submissionRepository.findById(5L)).willReturn(Optional.of(submission))
        given(feedbackRepository.findBySubmissionId(5L)).willReturn(feedback)

        submissionService.deleteSubmission(5L)

        // Feedback must be deleted first so the submission delete does not hit
        // the feedback -> submission foreign key.
        val ordered = inOrder(feedbackRepository, submissionRepository)
        ordered.verify(feedbackRepository).delete(feedback)
        ordered.verify(submissionRepository).delete(submission)
    }
}
