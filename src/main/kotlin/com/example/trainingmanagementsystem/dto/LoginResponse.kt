package com.example.trainingmanagementsystem.dto

import com.example.trainingmanagementsystem.enums.UserRole

data class LoginResponse(
    val id: Long,
    val fullName: String,
    val email: String,
    val role: UserRole,
    val token: String,
    val message: String
)