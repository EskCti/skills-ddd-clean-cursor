package com.example.shared.domain.repository

interface CreateRepository<T> {
    suspend fun create(entity: T): com.example.shared.domain.result.DomainResult<Unit>
}
