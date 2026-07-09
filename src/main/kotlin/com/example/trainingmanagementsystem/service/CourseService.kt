package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.CourseRequest
import com.example.trainingmanagementsystem.dto.CourseResponse
import com.example.trainingmanagementsystem.entity.CourseEntity
import com.example.trainingmanagementsystem.repository.CourseRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class CourseService(
    private val courseRepository: CourseRepository
) {

    fun createCourse(courseRequest: CourseRequest): CourseResponse {
        val courseTitle = courseRequest.title.trim()
        val courseDescription = courseRequest.description.trim()

        val courseEntity = CourseEntity(
            title = courseTitle,
            description = courseDescription
        )

        val savedCourse = courseRepository.save(courseEntity)
        return savedCourse.toCourseResponse()
    }

    fun getAllCourses(): List<CourseResponse> =
        courseRepository.findAll().map { courseEntity ->
            courseEntity.toCourseResponse()
        }

    fun getCourseById(courseId: Long): CourseResponse =
        findCourseEntityById(courseId).toCourseResponse()

    fun updateCourse(courseId: Long, courseRequest: CourseRequest): CourseResponse {
        val courseEntity = findCourseEntityById(courseId)

        courseEntity.title = courseRequest.title.trim()
        courseEntity.description = courseRequest.description.trim()

        val updatedCourse = courseRepository.save(courseEntity)
        return updatedCourse.toCourseResponse()
    }

    fun deleteCourse(courseId: Long) {
        val courseEntity = findCourseEntityById(courseId)

        try {
            courseRepository.delete(courseEntity)
        } catch (exception: DataIntegrityViolationException) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "This course cannot be deleted because it has related data.",
                exception
            )
        }
    }

    private fun findCourseEntityById(courseId: Long): CourseEntity =
        courseRepository.findById(courseId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found.")
        }

    private fun CourseEntity.toCourseResponse(): CourseResponse =
        CourseResponse(
            id = id,
            title = title,
            description = description
        )
}