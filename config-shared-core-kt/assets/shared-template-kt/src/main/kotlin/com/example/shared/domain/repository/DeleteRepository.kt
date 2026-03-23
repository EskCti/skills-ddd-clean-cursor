package com.example.shared.domain.repository

interface DeleteRepository {
    suspend fun delete(id: String): Result<Unit>
}
