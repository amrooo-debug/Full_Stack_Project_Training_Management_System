package com.example.trainingmanagementsystem.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive

data class FeedbackRequest(
    @field:Positive(message = "Trainer id must be positive")
    val trainerId: Long,

    @field:NotBlank(message = "Comment is required")
    val comment: String
)