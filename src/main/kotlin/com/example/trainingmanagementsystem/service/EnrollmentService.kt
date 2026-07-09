package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.EnrollmentRequest
import com.example.trainingmanagementsystem.dto.EnrollmentResponse
import com.example.trainingmanagementsystem.entity.CourseEntity
import com.example.trainingmanagementsystem.entity.EnrollmentEntity
import com.example.trainingmanagementsystem.entity.UserEntity
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
        val userEntity = findUserEntityById(enrollmentRequest.userId)
        val courseEntity = findCourseEntityById(enrollmentRequest.courseId)

        if (enrollmentRepository.existsByUserIdAndCourseId(userEntity.id, courseEntity.id)) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "This trainee is already enrolled in this course."
            )
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
        findUserEntityById(userId)

        return enrollmentRepository.findByUserId(userId).map { enrollmentEntity ->
            enrollmentEntity.toEnrollmentResponse()
        }
    }

    fun getEnrollmentsByCourseId(courseId: Long): List<EnrollmentResponse> {
        findCourseEntityById(courseId)

        return enrollmentRepository.findByCourseId(courseId).map { enrollmentEntity ->
            enrollmentEntity.toEnrollmentResponse()
        }
    }

    fun deleteEnrollment(enrollmentId: Long) {
        val enrollmentEntity = findEnrollmentEntityById(enrollmentId)
        enrollmentRepository.delete(enrollmentEntity)
    }

    private fun findUserEntityById(userId: Long): UserEntity =
        userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.")
        }

    private fun findCourseEntityById(courseId: Long): CourseEntity =
        courseRepository.findById(courseId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found.")
        }

    private fun findEnrollmentEntityById(enrollmentId: Long): EnrollmentEntity =
        enrollmentRepository.findById(enrollmentId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found.")
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