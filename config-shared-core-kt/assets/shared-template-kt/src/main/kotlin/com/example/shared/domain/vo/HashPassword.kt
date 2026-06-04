package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

@JvmInline
value class HashPassword private constructor(val value: String) {
    companion object {
        private const val INVALID_HASH = "Invalid bcrypt hash format"
        private val BCRYPT_REGEX = Regex("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$")

        fun create(value: String): HashPassword =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<HashPassword> {
            val trimmed = value.trim()
            if (!BCRYPT_REGEX.matches(trimmed)) {
                return DomainResult.failure(INVALID_HASH)
            }
            return DomainResult.success(HashPassword(trimmed))
        }
    }
}
