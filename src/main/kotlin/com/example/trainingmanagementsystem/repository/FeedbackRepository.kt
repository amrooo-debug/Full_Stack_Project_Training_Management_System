package com.example.trainingmanagementsystem.repository

import com.example.trainingmanagementsystem.entity.FeedbackEntity
import org.springframework.data.jpa.repository.JpaRepository

interface FeedbackRepository : JpaRepository<FeedbackEntity, Long> {

    fun findBySubmissionId(submissionId: Long): FeedbackEntity?

    fun findByTrainerId(trainerId: Long): List<FeedbackEntity>

    fun existsBySubmissionId(submissionId: Long): Boolean
}