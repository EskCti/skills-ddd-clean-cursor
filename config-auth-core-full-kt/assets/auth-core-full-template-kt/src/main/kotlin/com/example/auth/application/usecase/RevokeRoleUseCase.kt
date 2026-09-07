package com.example.auth.application.usecase

import com.example.auth.domain.repository.RoleRepository
import com.example.shared.domain.result.DomainResult

class RevokeRoleUseCase(
    private val roleRepository: RoleRepository
) {
    suspend fun execute(roleId: String, userId: String): DomainResult<Unit> {
        return roleRepository.revokeFromUser(roleId, userId)
    }
}