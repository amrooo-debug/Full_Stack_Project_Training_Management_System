package com.example.trainingmanagementsystem.repository

import com.example.trainingmanagementsystem.entity.LessonEntity
import org.springframework.data.jpa.repository.JpaRepository

interface LessonRepository : JpaRepository<LessonEntity, Long> {

    fun findByCourseId(courseId: Long): List<LessonEntity>
}