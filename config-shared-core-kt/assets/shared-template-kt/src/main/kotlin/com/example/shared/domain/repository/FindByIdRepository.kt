package com.example.shared.domain.repository

interface FindByIdRepository<T> {
    suspend fun findById(id: String): com.example.shared.domain.result.DomainResult<T>
}
