package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.TaskRequest
import com.example.trainingmanagementsystem.dto.TaskResponse
import com.example.trainingmanagementsystem.entity.CourseEntity
import com.example.trainingmanagementsystem.entity.TaskEntity
import com.example.trainingmanagementsystem.repository.CourseRepository
import com.example.trainingmanagementsystem.repository.TaskRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class TaskService(
    private val taskRepository: TaskRepository,
    private val courseRepository: CourseRepository
) {

    fun createTask(courseId: Long, taskRequest: TaskRequest): TaskResponse {
        val courseEntity = findCourseEntityById(courseId)

        val taskEntity = TaskEntity(
            title = taskRequest.title.trim(),
            description = taskRequest.description.trim(),
            course = courseEntity
        )

        val savedTask = taskRepository.save(taskEntity)
        return savedTask.toTaskResponse()
    }

    fun getTasksByCourseId(courseId: Long): List<TaskResponse> {
        findCourseEntityById(courseId)

        return taskRepository.findByCourseId(courseId).map { taskEntity ->
            taskEntity.toTaskResponse()
        }
    }

    fun getTaskById(courseId: Long, taskId: Long): TaskResponse =
        findTaskEntityByIdAndCourseId(courseId, taskId).toTaskResponse()

    fun updateTask(courseId: Long, taskId: Long, taskRequest: TaskRequest): TaskResponse {
        val taskEntity = findTaskEntityByIdAndCourseId(courseId, taskId)

        taskEntity.title = taskRequest.title.trim()
        taskEntity.description = taskRequest.description.trim()

        val updatedTask = taskRepository.save(taskEntity)
        return updatedTask.toTaskResponse()
    }

    fun deleteTask(courseId: Long, taskId: Long) {
        val taskEntity = findTaskEntityByIdAndCourseId(courseId, taskId)

        try {
            taskRepository.delete(taskEntity)
        } catch (exception: DataIntegrityViolationException) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "This task cannot be deleted because it has related data.",
                exception
            )
        }
    }

    private fun findCourseEntityById(courseId: Long): CourseEntity =
        courseRepository.findById(courseId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found.")
        }

    private fun findTaskEntityByIdAndCourseId(courseId: Long, taskId: Long): TaskEntity {
        findCourseEntityById(courseId)

        val taskEntity = taskRepository.findById(taskId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found.")
        }

        if (taskEntity.course?.id != courseId) {
            throw ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Task not found in this course."
            )
        }

        return taskEntity
    }

    private fun TaskEntity.toTaskResponse(): TaskResponse =
        TaskResponse(
            id = id,
            title = title,
            description = description,
            courseId = course?.id ?: 0,
            courseTitle = course?.title ?: ""
        )
}