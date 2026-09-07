package com.example.auth.application.usecase

import com.example.auth.application.dto.UserDto
import com.example.auth.application.query.FindUserByIdQuery
import com.example.shared.domain.result.DomainResult

class FindByIdUseCase(
    private val findUserById: FindUserByIdQuery
) {
    suspend fun execute(id: String): DomainResult<UserDto> {
        val user = findUserById.findById(id)
            ?: return DomainResult.failure(listOf("USER_NOT_FOUND"))
        return DomainResult.success(user)
    }
}