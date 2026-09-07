package com.example.auth.application.usecase

import com.example.auth.domain.repository.PermissionRepository
import com.example.shared.domain.result.DomainResult

class RevokePermissionUseCase(
    private val permissionRepository: PermissionRepository
) {
    suspend fun execute(permissionId: String, roleId: String): DomainResult<Unit> {
        return permissionRepository.revokeFromRole(permissionId, roleId)
    }
}