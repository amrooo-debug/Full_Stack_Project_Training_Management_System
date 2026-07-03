package com.example.trainingmanagementsystem.controller

import com.example.trainingmanagementsystem.dto.SubmissionRequest
import com.example.trainingmanagementsystem.dto.SubmissionResponse
import com.example.trainingmanagementsystem.service.SubmissionService
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
class SubmissionController(
    private val submissionService: SubmissionService
) {

    @PostMapping("/tasks/{taskId}/submissions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('TRAINEE')")
    fun createSubmission(
        @PathVariable taskId: Long,
        @Valid @RequestBody submissionRequest: SubmissionRequest
    ): SubmissionResponse =
        submissionService.createSubmission(taskId, submissionRequest)

    @GetMapping("/tasks/{taskId}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    fun getSubmissionsByTaskId(
        @PathVariable taskId: Long
    ): List<SubmissionResponse> =
        submissionService.getSubmissionsByTaskId(taskId)

    @GetMapping("/tasks/{taskId}/submissions/{submissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'TRAINEE')")
    fun getSubmissionById(
        @PathVariable taskId: Long,
        @PathVariable submissionId: Long
    ): SubmissionResponse =
        submissionService.getSubmissionById(taskId, submissionId)

    @GetMapping("/users/{userId}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'TRAINEE')")
    fun getSubmissionsByUserId(
        @PathVariable userId: Long
    ): List<SubmissionResponse> =
        submissionService.getSubmissionsByUserId(userId)

    @PutMapping("/tasks/{taskId}/submissions/{submissionId}")
    @PreAuthorize("hasRole('TRAINEE')")
    fun updateSubmission(
        @PathVariable taskId: Long,
        @PathVariable submissionId: Long,
        @Valid @RequestBody submissionRequest: SubmissionRequest
    ): SubmissionResponse =
        submissionService.updateSubmission(taskId, submissionId, submissionRequest)

    @DeleteMapping("/submissions/{submissionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    fun deleteSubmission(
        @PathVariable submissionId: Long
    ) {
        submissionService.deleteSubmission(submissionId)
    }
}