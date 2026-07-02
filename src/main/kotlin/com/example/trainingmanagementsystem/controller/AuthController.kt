package com.example.trainingmanagementsystem.controller

import com.example.trainingmanagementsystem.dto.LoginRequest
import com.example.trainingmanagementsystem.dto.LoginResponse
import com.example.trainingmanagementsystem.service.AuthService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody loginRequest: LoginRequest
    ): LoginResponse =
        authService.login(loginRequest)
}