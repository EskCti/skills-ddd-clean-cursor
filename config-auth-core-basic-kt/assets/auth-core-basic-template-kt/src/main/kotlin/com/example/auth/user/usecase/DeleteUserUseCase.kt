package com.example.auth.user.usecase

import com.example.auth.user.query.FindUserByIdQuery
import com.example.auth.user.repository.UserRepository

class DeleteUserUseCase(
    private val findUserById: FindUserByIdQuery,
    private val userRepository: UserRepository
) {
    suspend fun execute(id: String): Result<Unit> {
        findUserById.findById(id)
            ?: return Result.failure(IllegalArgumentException("USER_NOT_FOUND"))
        return userRepository.delete(id)
    }
}
