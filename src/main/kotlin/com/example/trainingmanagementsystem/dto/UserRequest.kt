package com.example.trainingmanagementsystem.dto

import com.example.trainingmanagementsystem.enums.UserRole
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class UserRequest(
    @field:NotBlank(message = "Full name is required")
    val fullName: String,

    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Email must be valid")
    val email: String,

    @field:NotNull(message = "Role is required")
    val role: UserRole
)