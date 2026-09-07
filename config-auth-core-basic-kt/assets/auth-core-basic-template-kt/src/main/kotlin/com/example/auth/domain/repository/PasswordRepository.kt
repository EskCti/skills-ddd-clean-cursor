package com.example.auth.domain.repository

import com.example.auth.domain.entity.Password
import com.example.shared.domain.result.DomainResult

interface PasswordRepository {
    suspend fun create(password: Password): DomainResult<Unit>
    suspend fun findByUserId(userId: String): Password?
    suspend fun findRecentByUserId(userId: String, limit: Int = 5): List<Password>
}