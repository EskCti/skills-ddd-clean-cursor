package com.example.auth.password.entity

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

        fun tryCreate(id: String? = null, userId: String, hash: String): Result<Password> {
            val validId = Id.tryCreate(id).getOrElse { return Result.failure(it) }
            val validUserId = Id.required(userId).getOrElse { return Result.failure(it) }
            val validHash = HashPassword.tryCreate(hash).getOrElse { return Result.failure(it) }
            return Result.success(Password(validId, validUserId, validHash))
        }
    }
}
