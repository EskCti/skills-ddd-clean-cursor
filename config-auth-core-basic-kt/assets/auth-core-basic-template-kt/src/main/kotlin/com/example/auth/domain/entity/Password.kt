package com.example.auth.domain.entity

import com.example.shared.domain.result.DomainResult
import com.example.shared.domain.vo.HashPassword
import com.example.shared.domain.vo.Id

data class Password private constructor(
    val id: Id,
    val userId: Id,
    val hash: HashPassword
) {
    companion object {
        fun create(id: String? = null, userId: String, hash: String): Password =
            tryCreate(id, userId, hash).getOrThrow()

        fun tryCreate(id: String? = null, userId: String, hash: String): DomainResult<Password> {
            val idResult = Id.tryCreate(id)
            val userIdResult = Id.required(userId)
            val hashResult = HashPassword.tryCreate(hash)

            val errors = listOf(idResult, userIdResult, hashResult).flatMap { it.errors }
            if (errors.isNotEmpty()) {
                return DomainResult.failure(errors)
            }

            return DomainResult.success(
                Password(
                    id = idResult.value!!,
                    userId = userIdResult.value!!,
                    hash = hashResult.value!!
                )
            )
        }
    }
}