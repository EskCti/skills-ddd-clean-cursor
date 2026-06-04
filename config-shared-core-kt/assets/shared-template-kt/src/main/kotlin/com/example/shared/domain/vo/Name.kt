package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

@JvmInline
value class Name private constructor(val value: String) {
    companion object {
        private const val INVALID_NAME = "Name must not be blank and must have at most 255 characters"

        fun create(value: String): Name =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<Name> {
            val errors = mutableListOf<String>()
            val normalized = value.trim()
            if (normalized.isBlank()) errors.add("Name must not be blank")
            if (normalized.length > 255) errors.add("Name must have at most 255 characters")
            if (errors.isNotEmpty()) return DomainResult.failure(errors)
            return DomainResult.success(Name(normalized))
        }
    }
}
