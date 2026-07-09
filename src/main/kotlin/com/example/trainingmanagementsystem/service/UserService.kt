package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.UserRequest
import com.example.trainingmanagementsystem.dto.UserResponse
import com.example.trainingmanagementsystem.entity.UserEntity
import com.example.trainingmanagementsystem.repository.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    fun createUser(userRequest: UserRequest): UserResponse {
        val normalizedEmail = userRequest.email.trim()
        val normalizedFullName = userRequest.fullName.trim()

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Email already exists.")
        }

        val userEntity = UserEntity(
            fullName = normalizedFullName,
            email = normalizedEmail,
            password = passwordEncoder.encode(userRequest.password),
            role = userRequest.role
        )

        val savedUser = userRepository.save(userEntity)
        return savedUser.toUserResponse()
    }

    fun getAllUsers(): List<UserResponse> =
        userRepository.findAll().map { userEntity ->
            userEntity.toUserResponse()
        }

    fun getUserById(userId: Long): UserResponse =
        findUserEntityById(userId).toUserResponse()

    fun updateUser(userId: Long, userRequest: UserRequest): UserResponse {
        val userEntity = findUserEntityById(userId)
        val normalizedEmail = userRequest.email.trim()
        val normalizedFullName = userRequest.fullName.trim()

        val emailUsedByAnotherUser = userRepository.existsByEmailAndIdNot(
            normalizedEmail,
            userId
        )

        if (emailUsedByAnotherUser) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Email already exists.")
        }

        userEntity.fullName = normalizedFullName
        userEntity.email = normalizedEmail
        userEntity.password = passwordEncoder.encode(userRequest.password)
        userEntity.role = userRequest.role

        val updatedUser = userRepository.save(userEntity)
        return updatedUser.toUserResponse()
    }

    fun deleteUser(userId: Long) {
        val userEntity = findUserEntityById(userId)

        try {
            userRepository.delete(userEntity)
        } catch (exception: DataIntegrityViolationException) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "This user cannot be deleted because it has related data.",
                exception
            )
        }
    }

    private fun findUserEntityById(userId: Long): UserEntity =
        userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.")
        }

    private fun UserEntity.toUserResponse(): UserResponse =
        UserResponse(
            id = id,
            fullName = fullName,
            email = email,
            role = role
        )
}