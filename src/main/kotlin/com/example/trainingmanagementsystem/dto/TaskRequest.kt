package com.example.trainingmanagementsystem.dto

import jakarta.validation.constraints.NotBlank

data class TaskRequest(
    @field:NotBlank(message = "Title is required")
    val title: String,

    @field:NotBlank(message = "Description is required")
    val description: String
)