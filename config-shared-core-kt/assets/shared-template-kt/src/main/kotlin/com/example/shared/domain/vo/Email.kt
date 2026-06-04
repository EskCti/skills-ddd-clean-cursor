package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

@JvmInline
value class Email private constructor(val value: String) {
    companion object {
        private const val INVALID_EMAIL = "Invalid email format"
        private val EMAIL_REGEX = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")

        fun create(value: String): Email =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<Email> {
            val errors = mutableListOf<String>()
            val normalized = value.trim().lowercase()
            if (normalized.isBlank()) errors.add("Email must not be blank")
            if (!EMAIL_REGEX.matches(normalized)) errors.add(INVALID_EMAIL)
            if (errors.isNotEmpty()) return DomainResult.failure(errors)
            return DomainResult.success(Email(normalized))
        }
    }

    val local: String get() = value.substringBefore('@')
    val domain: String get() = value.substringAfter('@')
}
