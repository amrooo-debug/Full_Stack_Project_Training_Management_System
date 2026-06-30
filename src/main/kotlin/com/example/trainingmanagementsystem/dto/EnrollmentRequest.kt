package com.example.trainingmanagementsystem.dto

import jakarta.validation.constraints.Positive

data class EnrollmentRequest(
    @field:Positive(message = "User id must be positive")
    val userId: Long,

    @field:Positive(message = "Course id must be positive")
    val courseId: Long
)