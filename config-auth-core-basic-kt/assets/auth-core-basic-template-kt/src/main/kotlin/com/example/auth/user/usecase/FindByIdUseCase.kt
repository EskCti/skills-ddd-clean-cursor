package com.example.auth.user.usecase

import com.example.auth.user.dto.UserDto
import com.example.auth.user.query.FindUserByIdQuery

class FindByIdUseCase(
    private val findUserById: FindUserByIdQuery
) {
    suspend fun execute(id: String): Result<UserDto> {
        val user = findUserById.findById(id)
            ?: return Result.failure(IllegalArgumentException("USER_NOT_FOUND"))
        return Result.success(user)
    }
}
