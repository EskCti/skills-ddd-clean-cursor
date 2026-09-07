package com.example.auth.application.usecase

import com.example.auth.domain.repository.PermissionRepository
import com.example.auth.domain.repository.RoleRepository
import com.example.shared.domain.result.DomainResult

class GrantPermissionUseCase(
    private val permissionRepository: PermissionRepository,
    private val roleRepository: RoleRepository
) {
    suspend fun execute(permissionId: String, roleId: String): DomainResult<Unit> {
        roleRepository.findById(roleId)
            ?: return DomainResult.failure(listOf("ROLE_NOT_FOUND"))
        permissionRepository.findById(permissionId)
            ?: return DomainResult.failure(listOf("PERMISSION_NOT_FOUND"))
        return permissionRepository.grantToRole(permissionId, roleId)
    }
}