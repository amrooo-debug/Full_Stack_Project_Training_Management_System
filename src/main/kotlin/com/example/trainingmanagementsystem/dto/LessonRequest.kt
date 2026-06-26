package com.example.trainingmanagementsystem.dto

import jakarta.validation.constraints.NotBlank

data class LessonRequest(
    @field:NotBlank(message = "Title is required")
    val title: String,

    @field:NotBlank(message = "Content is required")
    val content: String
)