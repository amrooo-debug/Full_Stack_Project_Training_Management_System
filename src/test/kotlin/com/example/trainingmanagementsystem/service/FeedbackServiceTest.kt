package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.FeedbackRequest
import com.example.trainingmanagementsystem.entity.FeedbackEntity
import com.example.trainingmanagementsystem.entity.SubmissionEntity
import com.example.trainingmanagementsystem.entity.UserEntity
import com.example.trainingmanagementsystem.enums.UserRole
import com.example.trainingmanagementsystem.repository.FeedbackRepository
import com.example.trainingmanagementsystem.repository.SubmissionRepository
import com.example.trainingmanagementsystem.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.BDDMockito.given
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

/**
 * Pure unit tests for FeedbackService. All repositories are mocked, so these
 * tests run without the Spring context and without a database.
 */
class FeedbackServiceTest {

    private val feedbackRepository: FeedbackRepository = mock(FeedbackRepository::class.java)
    private val submissionRepository: SubmissionRepository = mock(SubmissionRepository::class.java)
    private val userRepository: UserRepository = mock(UserRepository::class.java)

    private val feedbackService = FeedbackService(
        feedbackRepository,
        submissionRepository,
        userRepository
    )

    private fun trainerUser(id: Long) =
        UserEntity(id = id, fullName = "Trainer", email = "trainer@test.com", role = UserRole.TRAINER)

    private fun submission(id: Long) = SubmissionEntity(id = id, answer = "My answer")

    @Test
    fun `createFeedback throws 409 when feedback already exists for the submission`() {
        given(submissionRepository.findById(1L)).willReturn(Optional.of(submission(1L)))
        given(userRepository.findById(3L)).willReturn(Optional.of(trainerUser(3L)))
        given(feedbackRepository.existsBySubmissionId(1L)).willReturn(true)

        val request = FeedbackRequest(trainerId = 3L, comment = "Nice work")

        val exception = assertThrows<ResponseStatusException> {
            feedbackService.createFeedback(1L, request)
        }

        assertEquals(HttpStatus.CONFLICT, exception.statusCode)
        assertEquals("Feedback already exists for this submission", exception.reason)
    }

    @Test
    fun `createFeedback trims the comment before saving`() {
        given(submissionRepository.findById(1L)).willReturn(Optional.of(submission(1L)))
        given(userRepository.findById(3L)).willReturn(Optional.of(trainerUser(3L)))
        given(feedbackRepository.existsBySubmissionId(1L)).willReturn(false)
        given(feedbackRepository.save(any(FeedbackEntity::class.java)))
            .willReturn(FeedbackEntity(id = 7, comment = "Great job"))

        val request = FeedbackRequest(trainerId = 3L, comment = "   Great job   ")
        feedbackService.createFeedback(1L, request)

        val savedFeedback = ArgumentCaptor.forClass(FeedbackEntity::class.java)
        verify(feedbackRepository).save(savedFeedback.capture())
        assertEquals("Great job", savedFeedback.value.comment)
    }

    @Test
    fun `updateFeedback trims the comment before saving`() {
        val existingFeedback = FeedbackEntity(
            id = 7,
            comment = "Old comment",
            submission = submission(1L),
            trainer = trainerUser(3L)
        )
        given(submissionRepository.existsById(1L)).willReturn(true)
        given(feedbackRepository.findById(7L)).willReturn(Optional.of(existingFeedback))
        given(feedbackRepository.save(any(FeedbackEntity::class.java))).willReturn(existingFeedback)

        val request = FeedbackRequest(trainerId = 3L, comment = "   Updated comment   ")
        feedbackService.updateFeedback(1L, 7L, request)

        val savedFeedback = ArgumentCaptor.forClass(FeedbackEntity::class.java)
        verify(feedbackRepository).save(savedFeedback.capture())
        assertEquals("Updated comment", savedFeedback.value.comment)
    }

    @Test
    fun `updateFeedback throws 404 when the feedback belongs to another submission`() {
        // The feedback belongs to submission 1, but the update targets submission 2.
        val existingFeedback = FeedbackEntity(
            id = 7,
            comment = "Old comment",
            submission = submission(1L),
            trainer = trainerUser(3L)
        )
        given(submissionRepository.existsById(2L)).willReturn(true)
        given(feedbackRepository.findById(7L)).willReturn(Optional.of(existingFeedback))

        val request = FeedbackRequest(trainerId = 3L, comment = "New comment")

        val exception = assertThrows<ResponseStatusException> {
            feedbackService.updateFeedback(2L, 7L, request)
        }

        assertEquals(HttpStatus.NOT_FOUND, exception.statusCode)
        assertEquals("Feedback not found for this submission", exception.reason)
    }

    @Test
    fun `deleteFeedback throws 404 when the feedback does not exist`() {
        given(feedbackRepository.findById(99L)).willReturn(Optional.empty())

        val exception = assertThrows<ResponseStatusException> {
            feedbackService.deleteFeedback(99L)
        }

        assertEquals(HttpStatus.NOT_FOUND, exception.statusCode)
        assertEquals("Feedback not found", exception.reason)
    }
}
