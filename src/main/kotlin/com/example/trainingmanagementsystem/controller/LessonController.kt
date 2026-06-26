package com.example.trainingmanagementsystem.controller

import com.example.trainingmanagementsystem.dto.LessonRequest
import com.example.trainingmanagementsystem.dto.LessonResponse
import com.example.trainingmanagementsystem.service.LessonService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/courses/{courseId}/lessons")
class LessonController(
    private val lessonService: LessonService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createLesson(
        @PathVariable courseId: Long,
        @Valid @RequestBody lessonRequest: LessonRequest
    ): LessonResponse =
        lessonService.createLesson(courseId, lessonRequest)

    @GetMapping
    fun getLessonsByCourseId(
        @PathVariable courseId: Long
    ): List<LessonResponse> =
        lessonService.getLessonsByCourseId(courseId)
}