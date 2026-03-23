package com.example.auth.permission.entity

import com.example.shared.domain.vo.DotSeparatedName
import com.example.shared.domain.vo.Id

data class Permission private constructor(
    val id: Id,
    val name: DotSeparatedName,
    val description: String? = null
) {
    companion object {
        fun create(id: String? = null, name: String, description: String? = null): Permission =
            tryCreate(id, name, description).getOrThrow()

        fun tryCreate(id: String? = null, name: String, description: String? = null): Result<Permission> {
            val validId = Id.tryCreate(id).getOrElse { return Result.failure(it) }
            val validName = DotSeparatedName.tryCreate(name).getOrElse { return Result.failure(it) }
            return Result.success(Permission(validId, validName, description))
        }
    }

    override fun equals(other: Any?): Boolean = other is Permission && other.id == this.id
    override fun hashCode(): Int = id.hashCode()
}
