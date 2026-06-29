package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.dto.UserRequest
import com.example.trainingmanagementsystem.dto.UserResponse
import com.example.trainingmanagementsystem.entity.UserEntity
import com.example.trainingmanagementsystem.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class UserService(
    private val userRepository: UserRepository
) {

    fun createUser(userRequest: UserRequest): UserResponse {
        if (userRepository.existsByEmail(userRequest.email)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Email already exists")
        }

        val userEntity = UserEntity(
            fullName = userRequest.fullName,
            email = userRequest.email,
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

        if (userEntity.email != userRequest.email && userRepository.existsByEmail(userRequest.email)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Email already exists")
        }

        userEntity.fullName = userRequest.fullName
        userEntity.email = userRequest.email
        userEntity.role = userRequest.role

        val updatedUser = userRepository.save(userEntity)
        return updatedUser.toUserResponse()
    }

    fun deleteUser(userId: Long) {
        val userEntity = findUserEntityById(userId)
        userRepository.delete(userEntity)
    }

    private fun findUserEntityById(userId: Long): UserEntity =
        userRepository.findById(userId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")
        }

    private fun UserEntity.toUserResponse(): UserResponse =
        UserResponse(
            id = id,
            fullName = fullName,
            email = email,
            role = role
        )
}