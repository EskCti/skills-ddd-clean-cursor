package com.example.auth.domain.repository

import com.example.auth.domain.entity.Permission
import com.example.shared.domain.result.DomainResult

interface PermissionRepository {
    suspend fun create(permission: Permission): DomainResult<Unit>
    suspend fun findById(id: String): Permission?
    suspend fun findByRoleId(roleId: String): List<Permission>
    suspend fun findByUserId(userId: String): List<Permission>
    suspend fun grantToRole(permissionId: String, roleId: String): DomainResult<Unit>
    suspend fun revokeFromRole(permissionId: String, roleId: String): DomainResult<Unit>
}