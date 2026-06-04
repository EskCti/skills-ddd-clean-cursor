package com.example.shared.domain.repository

interface UpdateRepository<T> {
    suspend fun update(entity: T): com.example.shared.domain.result.DomainResult<Unit>
}
