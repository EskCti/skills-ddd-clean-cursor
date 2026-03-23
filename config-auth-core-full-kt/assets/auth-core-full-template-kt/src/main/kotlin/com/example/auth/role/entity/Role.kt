package com.example.auth.role.entity

import com.example.shared.domain.vo.Id
import com.example.shared.domain.vo.Name

data class Role private constructor(
    val id: Id,
    val name: Name,
    val description: String? = null
) {
    companion object {
        fun create(id: String? = null, name: String, description: String? = null): Role =
            tryCreate(id, name, description).getOrThrow()

        fun tryCreate(id: String? = null, name: String, description: String? = null): Result<Role> {
            val validId = Id.tryCreate(id).getOrElse { return Result.failure(it) }
            val validName = Name.tryCreate(name).getOrElse { return Result.failure(it) }
            return Result.success(Role(validId, validName, description))
        }
    }

    override fun equals(other: Any?): Boolean = other is Role && other.id == this.id
    override fun hashCode(): Int = id.hashCode()
}
