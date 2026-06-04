package com.example.shared.domain.repository

interface DeleteRepository {
    suspend fun delete(id: String): com.example.shared.domain.result.DomainResult<Unit>
}
