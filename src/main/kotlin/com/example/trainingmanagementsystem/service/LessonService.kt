package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.LessonRequest
import com.example.trainingmanagementsystem.dto.LessonResponse
import com.example.trainingmanagementsystem.entity.LessonEntity
import com.example.trainingmanagementsystem.repository.CourseRepository
import com.example.trainingmanagementsystem.repository.LessonRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class LessonService(
    private val lessonRepository: LessonRepository,
    private val courseRepository: CourseRepository
) {

    fun createLesson(courseId: Long, lessonRequest: LessonRequest): LessonResponse {
        val courseEntity = courseRepository.findById(courseId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found")
        }

        val lessonEntity = LessonEntity(
            title = lessonRequest.title,
            content = lessonRequest.content,
            course = courseEntity
        )

        val savedLesson = lessonRepository.save(lessonEntity)
        return savedLesson.toLessonResponse()
    }

    fun getLessonsByCourseId(courseId: Long): List<LessonResponse> {
        validateCourseExists(courseId)

        return lessonRepository.findByCourseId(courseId).map { lessonEntity ->
            lessonEntity.toLessonResponse()
        }
    }

    fun getLessonById(courseId: Long, lessonId: Long): LessonResponse =
        findLessonEntityByIdAndCourseId(courseId, lessonId).toLessonResponse()

    fun updateLesson(courseId: Long, lessonId: Long, lessonRequest: LessonRequest): LessonResponse {
        val lessonEntity = findLessonEntityByIdAndCourseId(courseId, lessonId)

        lessonEntity.title = lessonRequest.title
        lessonEntity.content = lessonRequest.content

        val updatedLesson = lessonRepository.save(lessonEntity)
        return updatedLesson.toLessonResponse()
    }

    fun deleteLesson(courseId: Long, lessonId: Long) {
        val lessonEntity = findLessonEntityByIdAndCourseId(courseId, lessonId)
        lessonRepository.delete(lessonEntity)
    }

    private fun validateCourseExists(courseId: Long) {
        if (!courseRepository.existsById(courseId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found")
        }
    }

    private fun findLessonEntityByIdAndCourseId(courseId: Long, lessonId: Long): LessonEntity {
        validateCourseExists(courseId)

        val lessonEntity = lessonRepository.findById(lessonId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found")
        }

        if (lessonEntity.course?.id != courseId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found in this course")
        }

        return lessonEntity
    }

    private fun LessonEntity.toLessonResponse(): LessonResponse =
        LessonResponse(
            id = id,
            title = title,
            content = content,
            courseId = course?.id ?: 0
        )
}