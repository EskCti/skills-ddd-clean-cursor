package com.example.auth.permission.usecase

import com.example.auth.permission.repository.PermissionRepository

class RevokePermissionUseCase(
    private val permissionRepository: PermissionRepository
) {
    suspend fun execute(permissionId: String, roleId: String): Result<Unit> {
        return permissionRepository.revokeFromRole(permissionId, roleId)
    }
}
