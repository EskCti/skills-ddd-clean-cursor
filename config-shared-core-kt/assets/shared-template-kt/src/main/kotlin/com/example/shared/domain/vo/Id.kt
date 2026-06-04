package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult
import java.util.UUID

@JvmInline
value class Id private constructor(val value: String) {
    companion object {
        private const val INVALID_ID = "Id must be a valid UUID"

        fun create(value: String? = null): Id =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String? = null): DomainResult<Id> {
            val resolved = value?.trim()?.ifBlank { null } ?: UUID.randomUUID().toString()
            return try {
                UUID.fromString(resolved)
                DomainResult.success(Id(resolved))
            } catch (e: IllegalArgumentException) {
                DomainResult.failure(INVALID_ID)
            }
        }

        fun required(value: String): DomainResult<Id> {
            if (value.isBlank()) {
                return DomainResult.failure(INVALID_ID)
            }
            return tryCreate(value)
        }
    }
}
