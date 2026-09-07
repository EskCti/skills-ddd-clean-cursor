package com.example.auth.domain.repository

import com.example.auth.domain.entity.Role
import com.example.shared.domain.result.DomainResult

interface RoleRepository {
    suspend fun create(role: Role): DomainResult<Unit>
    suspend fun findById(id: String): Role?
    suspend fun findByUserId(userId: String): List<Role>
    suspend fun assignToUser(roleId: String, userId: String): DomainResult<Unit>
    suspend fun revokeFromUser(roleId: String, userId: String): DomainResult<Unit>
}