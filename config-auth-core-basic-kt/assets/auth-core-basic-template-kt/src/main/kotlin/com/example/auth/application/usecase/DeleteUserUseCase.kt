package com.example.auth.application.usecase

import com.example.auth.application.query.FindUserByIdQuery
import com.example.auth.domain.repository.UserRepository
import com.example.shared.domain.result.DomainResult

class DeleteUserUseCase(
    private val findUserById: FindUserByIdQuery,
    private val userRepository: UserRepository
) {
    suspend fun execute(id: String): DomainResult<Unit> {
        findUserById.findById(id)
            ?: return DomainResult.failure(listOf("USER_NOT_FOUND"))
        return userRepository.delete(id)
    }
}