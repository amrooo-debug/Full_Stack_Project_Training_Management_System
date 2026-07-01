package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.SubmissionRequest
import com.example.trainingmanagementsystem.dto.SubmissionResponse
import com.example.trainingmanagementsystem.entity.SubmissionEntity
import com.example.trainingmanagementsystem.enums.UserRole
import com.example.trainingmanagementsystem.repository.SubmissionRepository
import com.example.trainingmanagementsystem.repository.TaskRepository
import com.example.trainingmanagementsystem.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

@Service
class SubmissionService(
    private val submissionRepository: SubmissionRepository,
    private val taskRepository: TaskRepository,
    private val userRepository: UserRepository
) {

    fun createSubmission(taskId: Long, submissionRequest: SubmissionRequest): SubmissionResponse {
        val taskEntity = taskRepository.findById(taskId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found")
        }

        val userEntity = userRepository.findById(submissionRequest.userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        }

        if (userEntity.role != UserRole.TRAINEE) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Only trainee users can submit tasks")
        }

        if (submissionRepository.existsByTaskIdAndUserId(taskId, submissionRequest.userId)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User already submitted this task")
        }

        val submissionEntity = SubmissionEntity(
            answer = submissionRequest.answer,
            submittedAt = LocalDateTime.now(),
            task = taskEntity,
            user = userEntity
        )

        val savedSubmission = submissionRepository.save(submissionEntity)
        return savedSubmission.toSubmissionResponse()
    }

    fun getSubmissionsByTaskId(taskId: Long): List<SubmissionResponse> {
        validateTaskExists(taskId)

        return submissionRepository.findByTaskId(taskId).map { submissionEntity ->
            submissionEntity.toSubmissionResponse()
        }
    }

    fun getSubmissionsByUserId(userId: Long): List<SubmissionResponse> {
        validateUserExists(userId)

        return submissionRepository.findByUserId(userId).map { submissionEntity ->
            submissionEntity.toSubmissionResponse()
        }
    }

    fun getSubmissionById(taskId: Long, submissionId: Long): SubmissionResponse =
        findSubmissionEntityByIdAndTaskId(taskId, submissionId).toSubmissionResponse()

    fun updateSubmission(
        taskId: Long,
        submissionId: Long,
        submissionRequest: SubmissionRequest
    ): SubmissionResponse {
        val submissionEntity = findSubmissionEntityByIdAndTaskId(taskId, submissionId)

        if (submissionEntity.user?.id != submissionRequest.userId) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission user cannot be changed")
        }

        submissionEntity.answer = submissionRequest.answer
        submissionEntity.submittedAt = LocalDateTime.now()

        val updatedSubmission = submissionRepository.save(submissionEntity)
        return updatedSubmission.toSubmissionResponse()
    }

    fun deleteSubmission(submissionId: Long) {
        val submissionEntity = submissionRepository.findById(submissionId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found")
        }

        submissionRepository.delete(submissionEntity)
    }

    private fun validateTaskExists(taskId: Long) {
        if (!taskRepository.existsById(taskId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found")
        }
    }

    private fun validateUserExists(userId: Long) {
        if (!userRepository.existsById(userId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        }
    }

    private fun findSubmissionEntityByIdAndTaskId(
        taskId: Long,
        submissionId: Long
    ): SubmissionEntity {
        validateTaskExists(taskId)

        val submissionEntity = submissionRepository.findById(submissionId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found")
        }

        if (submissionEntity.task?.id != taskId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found in this task")
        }

        return submissionEntity
    }

    private fun SubmissionEntity.toSubmissionResponse(): SubmissionResponse =
        SubmissionResponse(
            id = id,
            answer = answer,
            submittedAt = submittedAt,
            taskId = task?.id ?: 0,
            taskTitle = task?.title ?: "",
            userId = user?.id ?: 0,
            userFullName = user?.fullName ?: ""
        )
}