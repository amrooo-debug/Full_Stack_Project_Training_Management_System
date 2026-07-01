package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.TaskRequest
import com.example.trainingmanagementsystem.dto.TaskResponse
import com.example.trainingmanagementsystem.entity.TaskEntity
import com.example.trainingmanagementsystem.repository.CourseRepository
import com.example.trainingmanagementsystem.repository.TaskRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class TaskService(
    private val taskRepository: TaskRepository,
    private val courseRepository: CourseRepository
) {

    fun createTask(courseId: Long, taskRequest: TaskRequest): TaskResponse {
        val courseEntity = courseRepository.findById(courseId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found")
        }

        val taskEntity = TaskEntity(
            title = taskRequest.title,
            description = taskRequest.description,
            course = courseEntity
        )

        val savedTask = taskRepository.save(taskEntity)
        return savedTask.toTaskResponse()
    }

    fun getTasksByCourseId(courseId: Long): List<TaskResponse> {
        validateCourseExists(courseId)

        return taskRepository.findByCourseId(courseId).map { taskEntity ->
            taskEntity.toTaskResponse()
        }
    }

    fun getTaskById(courseId: Long, taskId: Long): TaskResponse =
        findTaskEntityByIdAndCourseId(courseId, taskId).toTaskResponse()

    fun updateTask(courseId: Long, taskId: Long, taskRequest: TaskRequest): TaskResponse {
        val taskEntity = findTaskEntityByIdAndCourseId(courseId, taskId)

        taskEntity.title = taskRequest.title
        taskEntity.description = taskRequest.description

        val updatedTask = taskRepository.save(taskEntity)
        return updatedTask.toTaskResponse()
    }

    fun deleteTask(courseId: Long, taskId: Long) {
        val taskEntity = findTaskEntityByIdAndCourseId(courseId, taskId)
        taskRepository.delete(taskEntity)
    }

    private fun validateCourseExists(courseId: Long) {
        if (!courseRepository.existsById(courseId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found")
        }
    }

    private fun findTaskEntityByIdAndCourseId(courseId: Long, taskId: Long): TaskEntity {
        validateCourseExists(courseId)

        val taskEntity = taskRepository.findById(taskId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found")
        }

        if (taskEntity.course?.id != courseId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found in this course")
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