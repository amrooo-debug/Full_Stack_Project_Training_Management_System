package com.example.trainingmanagementsystem.dto

import java.time.LocalDateTime

data class SubmissionResponse(
    val id: Long,
    val answer: String,
    val submittedAt: LocalDateTime,
    val taskId: Long,
    val taskTitle: String,
    val userId: Long,
    val userFullName: String
)