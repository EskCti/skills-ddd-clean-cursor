package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

@JvmInline
value class StrongPassword private constructor(val value: String) {
    companion object {
        private const val MIN_LENGTH = 8

        fun create(value: String): StrongPassword =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<StrongPassword> {
            val errors = mutableListOf<String>()
            if (value.length < MIN_LENGTH) errors.add("Password must be at least $MIN_LENGTH characters")
            if (!value.any { it.isUpperCase() }) errors.add("Password must contain an uppercase letter")
            if (!value.any { it.isLowerCase() }) errors.add("Password must contain a lowercase letter")
            if (!value.any { it.isDigit() }) errors.add("Password must contain a digit")
            if (!value.any { !it.isLetterOrDigit() }) errors.add("Password must contain a special character")
            if (errors.isNotEmpty()) return DomainResult.failure(errors)
            return DomainResult.success(StrongPassword(value))
        }
    }
}
