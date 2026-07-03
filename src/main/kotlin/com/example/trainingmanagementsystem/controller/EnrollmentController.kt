package com.example.trainingmanagementsystem.controller

import com.example.trainingmanagementsystem.dto.EnrollmentRequest
import com.example.trainingmanagementsystem.dto.EnrollmentResponse
import com.example.trainingmanagementsystem.service.EnrollmentService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/enrollments")
class EnrollmentController(
    private val enrollmentService: EnrollmentService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('TRAINEE')")
    fun createEnrollment(
        @Valid @RequestBody enrollmentRequest: EnrollmentRequest
    ): EnrollmentResponse =
        enrollmentService.createEnrollment(enrollmentRequest)

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    fun getAllEnrollments(): List<EnrollmentResponse> =
        enrollmentService.getAllEnrollments()

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'TRAINEE')")
    fun getEnrollmentsByUserId(
        @PathVariable userId: Long
    ): List<EnrollmentResponse> =
        enrollmentService.getEnrollmentsByUserId(userId)

    @GetMapping("/courses/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    fun getEnrollmentsByCourseId(
        @PathVariable courseId: Long
    ): List<EnrollmentResponse> =
        enrollmentService.getEnrollmentsByCourseId(courseId)

    @DeleteMapping("/{enrollmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteEnrollment(
        @PathVariable enrollmentId: Long
    ) {
        enrollmentService.deleteEnrollment(enrollmentId)
    }
}