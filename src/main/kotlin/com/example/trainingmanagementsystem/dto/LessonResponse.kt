package com.example.trainingmanagementsystem.dto

data class LessonResponse(
    val id: Long,
    val title: String,
    val content: String,
    val courseId: Long
)