package com.example.shared.domain.vo

import java.util.UUID

@JvmInline
value class Id private constructor(val value: String) {
    companion object {
        private const val INVALID_ID = "Id must be a valid UUID"

        fun create(value: String? = null): Id =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String? = null): Result<Id> {
            val resolved = value?.trim()?.ifBlank { null } ?: UUID.randomUUID().toString()
            return try {
                UUID.fromString(resolved)
                Result.success(Id(resolved))
            } catch (e: IllegalArgumentException) {
                Result.failure(IllegalArgumentException(INVALID_ID))
            }
        }

        fun required(value: String): Result<Id> {
            if (value.isBlank()) {
                return Result.failure(IllegalArgumentException(INVALID_ID))
            }
            return tryCreate(value)
        }
    }
}
