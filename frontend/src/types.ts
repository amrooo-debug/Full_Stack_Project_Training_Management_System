export type UserRole = 'ADMIN' | 'TRAINER' | 'TRAINEE'

export interface User {
    id: number
    fullName: string
    email: string
    role: UserRole
}

export interface Course {
    id: number
    title: string
    description: string
}

export interface Lesson {
    id: number
    title: string
    content: string
    courseId?: number
}

export interface Task {
    id: number
    title: string
    description: string
    courseId?: number
    courseTitle?: string
}

export interface Enrollment {
    id: number
    userId: number
    userFullName?: string
    userEmail?: string
    courseId: number
    courseTitle?: string
}

export interface Submission {
    id: number
    answer: string
    submittedAt?: string
    taskId: number
    taskTitle?: string
    userId: number
    userFullName?: string
    userEmail?: string
}

export interface Feedback {
    id: number
    comment: string
    givenAt?: string
    submissionId: number
    taskId?: number
    taskTitle?: string
    traineeId?: number
    traineeFullName?: string
    trainerId: number
    trainerFullName?: string
}