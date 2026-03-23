package com.example.auth.user.entity

import com.example.shared.domain.vo.Email
import com.example.shared.domain.vo.Id
import com.example.shared.domain.vo.Name

data class User private constructor(
    val id: Id,
    val name: Name,
    val email: Email,
    val admin: Boolean = false,
    val avatarUrl: String? = null
) {
    companion object {
        fun create(
            id: String? = null,
            name: String,
            email: String,
            admin: Boolean = false,
            avatarUrl: String? = null
        ): User = tryCreate(id, name, email, admin, avatarUrl).getOrThrow()

        fun tryCreate(
            id: String? = null,
            name: String,
            email: String,
            admin: Boolean = false,
            avatarUrl: String? = null
        ): Result<User> {
            val validId = Id.tryCreate(id).getOrElse { return Result.failure(it) }
            val validName = Name.tryCreate(name).getOrElse { return Result.failure(it) }
            val validEmail = Email.tryCreate(email).getOrElse { return Result.failure(it) }
            return Result.success(User(validId, validName, validEmail, admin, avatarUrl))
        }
    }

    override fun equals(other: Any?): Boolean = other is User && other.id == this.id
    override fun hashCode(): Int = id.hashCode()
}
