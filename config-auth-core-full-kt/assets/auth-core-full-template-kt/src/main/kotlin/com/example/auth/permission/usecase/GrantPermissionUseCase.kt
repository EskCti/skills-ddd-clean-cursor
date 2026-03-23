package com.example.auth.permission.usecase

import com.example.auth.permission.repository.PermissionRepository
import com.example.auth.role.repository.RoleRepository

class GrantPermissionUseCase(
    private val permissionRepository: PermissionRepository,
    private val roleRepository: RoleRepository
) {
    suspend fun execute(permissionId: String, roleId: String): Result<Unit> {
        roleRepository.findById(roleId)
            ?: return Result.failure(IllegalArgumentException("ROLE_NOT_FOUND"))
        permissionRepository.findById(permissionId)
            ?: return Result.failure(IllegalArgumentException("PERMISSION_NOT_FOUND"))
        return permissionRepository.grantToRole(permissionId, roleId)
    }
}
