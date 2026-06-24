package com.example.trainingmanagementsystem.repository

import com.example.trainingmanagementsystem.entity.CourseEntity
import org.springframework.data.jpa.repository.JpaRepository

interface CourseRepository : JpaRepository<CourseEntity, Long>