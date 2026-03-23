package com.example.auth.permission.repository

import com.example.auth.permission.entity.Permission

interface PermissionRepository {
    suspend fun create(permission: Permission): Result<Unit>
    suspend fun findById(id: String): Permission?
    suspend fun findByRoleId(roleId: String): List<Permission>
    suspend fun findByUserId(userId: String): List<Permission>
    suspend fun grantToRole(permissionId: String, roleId: String): Result<Unit>
    suspend fun revokeFromRole(permissionId: String, roleId: String): Result<Unit>
}
