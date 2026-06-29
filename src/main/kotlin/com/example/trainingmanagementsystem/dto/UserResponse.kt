package com.example.trainingmanagementsystem.dto

import com.example.trainingmanagementsystem.enums.UserRole

data class UserResponse(
    val id: Long,
    val fullName: String,
    val email: String,
    val role: UserRole
)