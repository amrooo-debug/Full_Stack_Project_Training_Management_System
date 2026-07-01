package com.example.trainingmanagementsystem.repository

import com.example.trainingmanagementsystem.entity.TaskEntity
import org.springframework.data.jpa.repository.JpaRepository

interface TaskRepository : JpaRepository<TaskEntity, Long> {

    fun findByCourseId(courseId: Long): List<TaskEntity>
}