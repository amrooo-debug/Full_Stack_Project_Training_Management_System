package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.CourseRequest
import com.example.trainingmanagementsystem.entity.CourseEntity
import com.example.trainingmanagementsystem.repository.CourseRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.BDDMockito.given
import org.mockito.BDDMockito.willThrow
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

/**
 * Pure unit tests for CourseService. The repository is mocked, so these tests
 * run without the Spring context and without a database.
 */
class CourseServiceTest {

    private val courseRepository: CourseRepository = mock(CourseRepository::class.java)
    private val courseService = CourseService(courseRepository)

    @Test
    fun `getCourseById throws 404 when the course does not exist`() {
        given(courseRepository.findById(99L)).willReturn(Optional.empty())

        val exception = assertThrows<ResponseStatusException> {
            courseService.getCourseById(99L)
        }

        assertEquals(HttpStatus.NOT_FOUND, exception.statusCode)
    }

    @Test
    fun `createCourse trims the title and description before saving`() {
        val request = CourseRequest(
            title = "  Intro to React  ",
            description = "  Learn the basics  "
        )
        // Return a stored entity so the service can map it to a response.
        given(courseRepository.save(any(CourseEntity::class.java)))
            .willReturn(CourseEntity(id = 1, title = "Intro to React", description = "Learn the basics"))

        courseService.createCourse(request)

        val savedEntity = ArgumentCaptor.forClass(CourseEntity::class.java)
        verify(courseRepository).save(savedEntity.capture())
        assertEquals("Intro to React", savedEntity.value.title)
        assertEquals("Learn the basics", savedEntity.value.description)
    }

    @Test
    fun `deleteCourse throws 409 when the repository reports related data`() {
        val existingCourse = CourseEntity(id = 1, title = "Kotlin Basics", description = "Backend course")
        given(courseRepository.findById(1L)).willReturn(Optional.of(existingCourse))
        willThrow(DataIntegrityViolationException("related rows exist"))
            .given(courseRepository).delete(existingCourse)

        val exception = assertThrows<ResponseStatusException> {
            courseService.deleteCourse(1L)
        }

        assertEquals(HttpStatus.CONFLICT, exception.statusCode)
        assertEquals(
            "This course cannot be deleted because it has related data.",
            exception.reason
        )
    }
}
