package com.example.auth.domain.entity

import com.example.shared.domain.result.DomainResult
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
        ): DomainResult<User> {
            val idResult = Id.tryCreate(id)
            val nameResult = Name.tryCreate(name)
            val emailResult = Email.tryCreate(email)

            val errors = listOf(idResult, nameResult, emailResult).flatMap { it.errors }
            if (errors.isNotEmpty()) {
                return DomainResult.failure(errors)
            }

            return DomainResult.success(
                User(
                    id = idResult.value!!,
                    name = nameResult.value!!,
                    email = emailResult.value!!,
                    admin = admin,
                    avatarUrl = avatarUrl
                )
            )
        }
    }

    override fun equals(other: Any?): Boolean = other is User && other.id == this.id
    override fun hashCode(): Int = id.hashCode()
}