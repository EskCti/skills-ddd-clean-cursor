package com.example.auth.role.usecase

import com.example.auth.role.repository.RoleRepository

class RevokeRoleUseCase(
    private val roleRepository: RoleRepository
) {
    suspend fun execute(roleId: String, userId: String): Result<Unit> {
        return roleRepository.revokeFromUser(roleId, userId)
    }
}
