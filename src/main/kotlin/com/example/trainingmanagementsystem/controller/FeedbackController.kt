package com.example.trainingmanagementsystem.controller

import com.example.trainingmanagementsystem.dto.FeedbackRequest
import com.example.trainingmanagementsystem.dto.FeedbackResponse
import com.example.trainingmanagementsystem.service.FeedbackService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
class FeedbackController(
    private val feedbackService: FeedbackService
) {

    @PostMapping("/submissions/{submissionId}/feedback")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    fun createFeedback(
        @PathVariable submissionId: Long,
        @Valid @RequestBody feedbackRequest: FeedbackRequest
    ): FeedbackResponse =
        feedbackService.createFeedback(submissionId, feedbackRequest)

    @GetMapping("/submissions/{submissionId}/feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'TRAINEE')")
    fun getFeedbackBySubmissionId(
        @PathVariable submissionId: Long
    ): FeedbackResponse =
        feedbackService.getFeedbackBySubmissionId(submissionId)

    @GetMapping("/trainers/{trainerId}/feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    fun getFeedbackByTrainerId(
        @PathVariable trainerId: Long
    ): List<FeedbackResponse> =
        feedbackService.getFeedbackByTrainerId(trainerId)

    @GetMapping("/feedback/{feedbackId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'TRAINEE')")
    fun getFeedbackById(
        @PathVariable feedbackId: Long
    ): FeedbackResponse =
        feedbackService.getFeedbackById(feedbackId)

    @PutMapping("/submissions/{submissionId}/feedback/{feedbackId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    fun updateFeedback(
        @PathVariable submissionId: Long,
        @PathVariable feedbackId: Long,
        @Valid @RequestBody feedbackRequest: FeedbackRequest
    ): FeedbackResponse =
        feedbackService.updateFeedback(submissionId, feedbackId, feedbackRequest)

    @DeleteMapping("/feedback/{feedbackId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    fun deleteFeedback(
        @PathVariable feedbackId: Long
    ) {
        feedbackService.deleteFeedback(feedbackId)
    }
}