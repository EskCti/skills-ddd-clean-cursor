package com.example.auth.role.repository

import com.example.auth.role.entity.Role

interface RoleRepository {
    suspend fun create(role: Role): Result<Unit>
    suspend fun findById(id: String): Role?
    suspend fun findByUserId(userId: String): List<Role>
    suspend fun assignToUser(roleId: String, userId: String): Result<Unit>
    suspend fun revokeFromUser(roleId: String, userId: String): Result<Unit>
}
