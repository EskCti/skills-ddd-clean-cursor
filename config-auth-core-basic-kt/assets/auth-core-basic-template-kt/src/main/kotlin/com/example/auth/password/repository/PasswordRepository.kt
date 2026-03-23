package com.example.auth.password.repository

import com.example.auth.password.entity.Password

interface PasswordRepository {
    suspend fun create(password: Password): Result<Unit>
    suspend fun findByUserId(userId: String): Password?
    suspend fun findRecentByUserId(userId: String, limit: Int = 5): List<Password>
}
