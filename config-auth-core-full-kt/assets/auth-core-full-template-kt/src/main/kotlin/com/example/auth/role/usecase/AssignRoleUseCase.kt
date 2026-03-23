package com.example.auth.role.usecase

import com.example.auth.role.repository.RoleRepository
import com.example.auth.user.query.FindUserByIdQuery

class AssignRoleUseCase(
    private val roleRepository: RoleRepository,
    private val findUserById: FindUserByIdQuery
) {
    suspend fun execute(roleId: String, userId: String): Result<Unit> {
        findUserById.findById(userId)
            ?: return Result.failure(IllegalArgumentException("USER_NOT_FOUND"))
        roleRepository.findById(roleId)
            ?: return Result.failure(IllegalArgumentException("ROLE_NOT_FOUND"))
        return roleRepository.assignToUser(roleId, userId)
    }
}
