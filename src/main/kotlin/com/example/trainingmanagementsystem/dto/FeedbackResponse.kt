package com.example.trainingmanagementsystem.dto

import java.time.LocalDateTime

data class FeedbackResponse(
    val id: Long,
    val comment: String,
    val givenAt: LocalDateTime,
    val submissionId: Long,
    val taskId: Long,
    val taskTitle: String,
    val traineeId: Long,
    val traineeFullName: String,
    val trainerId: Long,
    val trainerFullName: String
)