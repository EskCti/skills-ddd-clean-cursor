package com.example.auth.application.query

interface UserExistsQuery {
    suspend fun existsByEmail(email: String): Boolean
    suspend fun existsById(id: String): Boolean
}
