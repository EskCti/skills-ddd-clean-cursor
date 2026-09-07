package com.example.auth.application.usecase

import com.example.auth.application.dto.UserDto
import com.example.auth.application.query.FindUserByEmailQuery
import com.example.shared.domain.result.DomainResult

class FindByEmailUseCase(
    private val findUserByEmail: FindUserByEmailQuery
) {
    suspend fun execute(email: String): DomainResult<UserDto> {
        val user = findUserByEmail.findByEmail(email)
            ?: return DomainResult.failure(listOf("USER_NOT_FOUND"))
        return DomainResult.success(user)
    }
}