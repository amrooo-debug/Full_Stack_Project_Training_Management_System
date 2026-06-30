package com.example.trainingmanagementsystem.dto

data class EnrollmentResponse(
    val id: Long,
    val userId: Long,
    val userFullName: String,
    val courseId: Long,
    val courseTitle: String
)