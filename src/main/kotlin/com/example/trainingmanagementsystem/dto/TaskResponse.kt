package com.example.trainingmanagementsystem.dto

data class TaskResponse(
    val id: Long,
    val title: String,
    val description: String,
    val courseId: Long,
    val courseTitle: String
)