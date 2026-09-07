package com.example.auth.domain.repository

import com.example.auth.domain.entity.User
import com.example.shared.domain.result.DomainResult

interface UserRepository {
    suspend fun create(user: User): DomainResult<Unit>
    suspend fun update(user: User): DomainResult<Unit>
    suspend fun delete(id: String): DomainResult<Unit>
}