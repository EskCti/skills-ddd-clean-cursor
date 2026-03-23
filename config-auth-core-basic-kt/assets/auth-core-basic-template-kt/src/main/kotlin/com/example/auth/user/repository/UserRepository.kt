package com.example.auth.user.repository

import com.example.auth.user.entity.User

interface UserRepository {
    suspend fun create(user: User): Result<Unit>
    suspend fun update(user: User): Result<Unit>
    suspend fun delete(id: String): Result<Unit>
}
