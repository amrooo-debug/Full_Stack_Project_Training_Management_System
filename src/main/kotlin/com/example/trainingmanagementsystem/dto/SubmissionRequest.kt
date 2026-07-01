package com.example.trainingmanagementsystem.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive

data class SubmissionRequest(
    @field:Positive(message = "User id must be positive")
    val userId: Long,

    @field:NotBlank(message = "Answer is required")
    val answer: String
)