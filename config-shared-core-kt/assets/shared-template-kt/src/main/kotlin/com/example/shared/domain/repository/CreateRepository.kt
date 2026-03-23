package com.example.shared.domain.repository

interface CreateRepository<T> {
    suspend fun create(entity: T): Result<Unit>
}
