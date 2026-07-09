package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.FeedbackRequest
import com.example.trainingmanagementsystem.dto.FeedbackResponse
import com.example.trainingmanagementsystem.entity.FeedbackEntity
import com.example.trainingmanagementsystem.entity.SubmissionEntity
import com.example.trainingmanagementsystem.entity.UserEntity
import com.example.trainingmanagementsystem.enums.UserRole
import com.example.trainingmanagementsystem.repository.FeedbackRepository
import com.example.trainingmanagementsystem.repository.SubmissionRepository
import com.example.trainingmanagementsystem.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

@Service
class FeedbackService(
    private val feedbackRepository: FeedbackRepository,
    private val submissionRepository: SubmissionRepository,
    private val userRepository: UserRepository
) {

    fun createFeedback(submissionId: Long, feedbackRequest: FeedbackRequest): FeedbackResponse {
        val submissionEntity = findSubmissionEntityById(submissionId)

        val trainerEntity = findTrainerEntityById(feedbackRequest.trainerId)

        if (feedbackRepository.existsBySubmissionId(submissionId)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Feedback already exists for this submission")
        }

        val feedbackEntity = FeedbackEntity(
            comment = feedbackRequest.comment.trim(),
            givenAt = LocalDateTime.now(),
            submission = submissionEntity,
            trainer = trainerEntity
        )

        val savedFeedback = feedbackRepository.save(feedbackEntity)
        return savedFeedback.toFeedbackResponse()
    }

    fun getFeedbackBySubmissionId(submissionId: Long): FeedbackResponse {
        validateSubmissionExists(submissionId)

        val feedbackEntity = feedbackRepository.findBySubmissionId(submissionId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found")

        return feedbackEntity.toFeedbackResponse()
    }

    fun getFeedbackByTrainerId(trainerId: Long): List<FeedbackResponse> {
        findTrainerEntityById(trainerId)

        return feedbackRepository.findByTrainerId(trainerId).map { feedbackEntity ->
            feedbackEntity.toFeedbackResponse()
        }
    }

    fun getFeedbackById(feedbackId: Long): FeedbackResponse =
        findFeedbackEntityById(feedbackId).toFeedbackResponse()

    fun updateFeedback(
        submissionId: Long,
        feedbackId: Long,
        feedbackRequest: FeedbackRequest
    ): FeedbackResponse {
        val feedbackEntity = findFeedbackEntityByIdAndSubmissionId(submissionId, feedbackId)

        if (feedbackEntity.trainer?.id != feedbackRequest.trainerId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Feedback trainer cannot be changed")
        }

        feedbackEntity.comment = feedbackRequest.comment.trim()
        feedbackEntity.givenAt = LocalDateTime.now()

        val updatedFeedback = feedbackRepository.save(feedbackEntity)
        return updatedFeedback.toFeedbackResponse()
    }

    fun deleteFeedback(feedbackId: Long) {
        val feedbackEntity = findFeedbackEntityById(feedbackId)

        feedbackRepository.delete(feedbackEntity)
    }

    private fun validateSubmissionExists(submissionId: Long) {
        if (!submissionRepository.existsById(submissionId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found")
        }
    }

    private fun findSubmissionEntityById(submissionId: Long): SubmissionEntity =
        submissionRepository.findById(submissionId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found")
        }

    private fun findTrainerEntityById(trainerId: Long): UserEntity {
        val trainerEntity = userRepository.findById(trainerId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Trainer not found")
        }

        if (trainerEntity.role != UserRole.TRAINER) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Only trainer users can give feedback")
        }

        return trainerEntity
    }

    private fun findFeedbackEntityById(feedbackId: Long): FeedbackEntity =
        feedbackRepository.findById(feedbackId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found")
        }

    private fun findFeedbackEntityByIdAndSubmissionId(
        submissionId: Long,
        feedbackId: Long
    ): FeedbackEntity {
        validateSubmissionExists(submissionId)

        val feedbackEntity = findFeedbackEntityById(feedbackId)

        if (feedbackEntity.submission?.id != submissionId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found for this submission")
        }

        return feedbackEntity
    }

    private fun FeedbackEntity.toFeedbackResponse(): FeedbackResponse =
        FeedbackResponse(
            id = id,
            comment = comment,
            givenAt = givenAt,
            submissionId = submission?.id ?: 0,
            taskId = submission?.task?.id ?: 0,
            taskTitle = submission?.task?.title ?: "",
            traineeId = submission?.user?.id ?: 0,
            traineeFullName = submission?.user?.fullName ?: "",
            trainerId = trainer?.id ?: 0,
            trainerFullName = trainer?.fullName ?: ""
        )
}
