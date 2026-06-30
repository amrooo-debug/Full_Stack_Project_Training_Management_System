package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.EnrollmentRequest
import com.example.trainingmanagementsystem.dto.EnrollmentResponse
import com.example.trainingmanagementsystem.entity.EnrollmentEntity
import com.example.trainingmanagementsystem.repository.CourseRepository
import com.example.trainingmanagementsystem.repository.EnrollmentRepository
import com.example.trainingmanagementsystem.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class EnrollmentService(
    private val enrollmentRepository: EnrollmentRepository,
    private val userRepository: UserRepository,
    private val courseRepository: CourseRepository
) {

    fun createEnrollment(enrollmentRequest: EnrollmentRequest): EnrollmentResponse {
        val userEntity = userRepository.findById(enrollmentRequest.userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        }

        val courseEntity = courseRepository.findById(enrollmentRequest.courseId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found")
        }

        if (enrollmentRepository.existsByUserIdAndCourseId(userEntity.id, courseEntity.id)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User is already enrolled in this course")
        }

        val enrollmentEntity = EnrollmentEntity(
            user = userEntity,
            course = courseEntity
        )

        val savedEnrollment = enrollmentRepository.save(enrollmentEntity)
        return savedEnrollment.toEnrollmentResponse()
    }

    fun getAllEnrollments(): List<EnrollmentResponse> =
        enrollmentRepository.findAll().map { enrollmentEntity ->
            enrollmentEntity.toEnrollmentResponse()
        }

    fun getEnrollmentsByUserId(userId: Long): List<EnrollmentResponse> {
        if (!userRepository.existsById(userId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        }

        return enrollmentRepository.findByUserId(userId).map { enrollmentEntity ->
            enrollmentEntity.toEnrollmentResponse()
        }
    }

    fun getEnrollmentsByCourseId(courseId: Long): List<EnrollmentResponse> {
        if (!courseRepository.existsById(courseId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found")
        }

        return enrollmentRepository.findByCourseId(courseId).map { enrollmentEntity ->
            enrollmentEntity.toEnrollmentResponse()
        }
    }

    fun deleteEnrollment(enrollmentId: Long) {
        val enrollmentEntity = enrollmentRepository.findById(enrollmentId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found")
        }

        enrollmentRepository.delete(enrollmentEntity)
    }

    private fun EnrollmentEntity.toEnrollmentResponse(): EnrollmentResponse =
        EnrollmentResponse(
            id = id,
            userId = user?.id ?: 0,
            userFullName = user?.fullName ?: "",
            courseId = course?.id ?: 0,
            courseTitle = course?.title ?: ""
        )
}