package com.example.trainingmanagementsystem.controller

import com.example.trainingmanagementsystem.dto.UserRequest
import com.example.trainingmanagementsystem.dto.UserResponse
import com.example.trainingmanagementsystem.service.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/users")
class UserController(
    private val userService: UserService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createUser(
        @Valid @RequestBody userRequest: UserRequest
    ): UserResponse =
        userService.createUser(userRequest)

    @GetMapping
    fun getAllUsers(): List<UserResponse> =
        userService.getAllUsers()

    @GetMapping("/{userId}")
    fun getUserById(
        @PathVariable userId: Long
    ): UserResponse =
        userService.getUserById(userId)

    @PutMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: Long,
        @Valid @RequestBody userRequest: UserRequest
    ): UserResponse =
        userService.updateUser(userId, userRequest)

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteUser(
        @PathVariable userId: Long
    ) {
        userService.deleteUser(userId)
    }
}