package com.example.trainingmanagementsystem.repository

import com.example.trainingmanagementsystem.entity.UserEntity
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<UserEntity, Long> {

    fun existsByEmail(email: String): Boolean

    fun existsByEmailAndIdNot(email: String, id: Long): Boolean

    fun findByEmail(email: String): UserEntity?
}