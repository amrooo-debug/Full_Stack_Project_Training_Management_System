package com.example.trainingmanagementsystem.controller

import com.example.trainingmanagementsystem.dto.CourseRequest
import com.example.trainingmanagementsystem.dto.CourseResponse
import com.example.trainingmanagementsystem.service.CourseService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/courses")
class CourseController(
    private val courseService: CourseService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    fun createCourse(
        @Valid @RequestBody courseRequest: CourseRequest
    ): CourseResponse =
        courseService.createCourse(courseRequest)

    @GetMapping
    fun getAllCourses(): List<CourseResponse> =
        courseService.getAllCourses()

    @GetMapping("/{courseId}")
    fun getCourseById(
        @PathVariable courseId: Long
    ): CourseResponse =
        courseService.getCourseById(courseId)

    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    fun updateCourse(
        @PathVariable courseId: Long,
        @Valid @RequestBody courseRequest: CourseRequest
    ): CourseResponse =
        courseService.updateCourse(courseId, courseRequest)

    @DeleteMapping("/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteCourse(
        @PathVariable courseId: Long
    ) {
        courseService.deleteCourse(courseId)
    }
}