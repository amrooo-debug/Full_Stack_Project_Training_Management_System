package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.LoginRequest
import com.example.trainingmanagementsystem.dto.LoginResponse
import com.example.trainingmanagementsystem.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    fun login(loginRequest: LoginRequest): LoginResponse {
        val userEntity = userRepository.findByEmail(loginRequest.email)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password")

        val passwordMatches = passwordEncoder.matches(
            loginRequest.password,
            userEntity.password
        )

        if (!passwordMatches) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password")
        }

        val token = jwtService.generateToken(userEntity)

        return LoginResponse(
            id = userEntity.id,
            fullName = userEntity.fullName,
            email = userEntity.email,
            role = userEntity.role,
            token = token,
            message = "Login successful"
        )
    }
}