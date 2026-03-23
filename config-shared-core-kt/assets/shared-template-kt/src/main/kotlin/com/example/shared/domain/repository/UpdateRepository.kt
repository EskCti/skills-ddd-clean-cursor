package com.example.shared.domain.repository

interface UpdateRepository<T> {
    suspend fun update(entity: T): Result<Unit>
}
