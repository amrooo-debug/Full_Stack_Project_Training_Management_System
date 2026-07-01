package com.example.trainingmanagementsystem.controller

import com.example.trainingmanagementsystem.dto.TaskRequest
import com.example.trainingmanagementsystem.dto.TaskResponse
import com.example.trainingmanagementsystem.service.TaskService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
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
@RequestMapping("/courses/{courseId}/tasks")
class TaskController(
    private val taskService: TaskService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createTask(
        @PathVariable courseId: Long,
        @Valid @RequestBody taskRequest: TaskRequest
    ): TaskResponse =
        taskService.createTask(courseId, taskRequest)

    @GetMapping
    fun getTasksByCourseId(
        @PathVariable courseId: Long
    ): List<TaskResponse> =
        taskService.getTasksByCourseId(courseId)

    @GetMapping("/{taskId}")
    fun getTaskById(
        @PathVariable courseId: Long,
        @PathVariable taskId: Long
    ): TaskResponse =
        taskService.getTaskById(courseId, taskId)

    @PutMapping("/{taskId}")
    fun updateTask(
        @PathVariable courseId: Long,
        @PathVariable taskId: Long,
        @Valid @RequestBody taskRequest: TaskRequest
    ): TaskResponse =
        taskService.updateTask(courseId, taskId, taskRequest)

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteTask(
        @PathVariable courseId: Long,
        @PathVariable taskId: Long
    ) {
        taskService.deleteTask(courseId, taskId)
    }
}