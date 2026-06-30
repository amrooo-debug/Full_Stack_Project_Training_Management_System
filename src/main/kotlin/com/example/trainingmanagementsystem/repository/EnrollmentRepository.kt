package com.example.trainingmanagementsystem.repository

import com.example.trainingmanagementsystem.entity.EnrollmentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface EnrollmentRepository : JpaRepository<EnrollmentEntity, Long> {

    fun findByUserId(userId: Long): List<EnrollmentEntity>

    fun findByCourseId(courseId: Long): List<EnrollmentEntity>

    fun existsByUserIdAndCourseId(userId: Long, courseId: Long): Boolean
}