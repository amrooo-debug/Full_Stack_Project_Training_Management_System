package com.example.trainingmanagementsystem.repository

import com.example.trainingmanagementsystem.entity.SubmissionEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SubmissionRepository : JpaRepository<SubmissionEntity, Long> {

    fun findByTaskId(taskId: Long): List<SubmissionEntity>

    fun findByUserId(userId: Long): List<SubmissionEntity>

    fun existsByTaskIdAndUserId(taskId: Long, userId: Long): Boolean
}