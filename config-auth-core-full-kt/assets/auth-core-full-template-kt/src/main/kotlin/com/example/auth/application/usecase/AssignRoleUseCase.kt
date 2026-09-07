package com.example.auth.application.usecase

import com.example.auth.application.query.FindUserByIdQuery
import com.example.auth.domain.repository.RoleRepository
import com.example.shared.domain.result.DomainResult

class AssignRoleUseCase(
    private val roleRepository: RoleRepository,
    private val findUserById: FindUserByIdQuery
) {
    suspend fun execute(roleId: String, userId: String): DomainResult<Unit> {
        findUserById.findById(userId)
            ?: return DomainResult.failure(listOf("USER_NOT_FOUND"))
        roleRepository.findById(roleId)
            ?: return DomainResult.failure(listOf("ROLE_NOT_FOUND"))
        return roleRepository.assignToUser(roleId, userId)
    }
}