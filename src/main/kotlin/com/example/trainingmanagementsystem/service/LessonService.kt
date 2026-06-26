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
        if (!courseRepository.existsById(courseId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found")
        }

        return lessonRepository.findByCourseId(courseId).map { lessonEntity ->
            lessonEntity.toLessonResponse()
        }
    }

    private fun LessonEntity.toLessonResponse(): LessonResponse =
        LessonResponse(
            id = id,
            title = title,
            content = content,
            courseId = course?.id ?: 0
        )
}