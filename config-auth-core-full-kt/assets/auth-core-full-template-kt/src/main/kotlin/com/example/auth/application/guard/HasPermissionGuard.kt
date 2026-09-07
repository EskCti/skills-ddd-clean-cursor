package com.example.auth.application.guard

import com.example.auth.domain.repository.PermissionRepository

class HasPermissionGuard(
    private val permissionRepository: PermissionRepository
) {
    suspend fun check(userId: String, requiredPermission: String): Boolean {
        val permissions = permissionRepository.findByUserId(userId)
        return permissions.any { it.name.value == requiredPermission }
    }
}