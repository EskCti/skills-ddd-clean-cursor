package com.example.auth.user.usecase

import com.example.auth.user.dto.UserDto
import com.example.auth.user.query.FindUserByEmailQuery

class FindByEmailUseCase(
    private val findUserByEmail: FindUserByEmailQuery
) {
    suspend fun execute(email: String): Result<UserDto> {
        val user = findUserByEmail.findByEmail(email)
            ?: return Result.failure(IllegalArgumentException("USER_NOT_FOUND"))
        return Result.success(user)
    }
}
