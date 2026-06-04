package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult

@JvmInline
value class PersonName private constructor(val value: String) {
    companion object {
        const val TOO_SHORT = "NAME_TOO_SHORT"
        const val TOO_LONG = "NAME_TOO_LONG"
        const val MUST_HAVE_FIRST_AND_LAST_NAME = "MUST_HAVE_FIRST_AND_LAST_NAME"
        private const val MIN_LENGTH = 3
        private const val MAX_LENGTH = 50

        fun create(value: String): PersonName =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<PersonName> {
            val errors = mutableListOf<String>()
            val trimmed = value.trim()
            if (trimmed.length < MIN_LENGTH) errors.add(TOO_SHORT)
            if (trimmed.length > MAX_LENGTH) errors.add(TOO_LONG)
            val words = trimmed.split(Regex("\\s+")).filter { it.isNotEmpty() }
            if (words.size < 2) errors.add(MUST_HAVE_FIRST_AND_LAST_NAME)
            if (errors.isNotEmpty()) return DomainResult.failure(errors)
            return DomainResult.success(PersonName(trimmed))
        }
    }

    val firstName: String get() = value.split(Regex("\\s+")).first()
    val lastName: String get() = value.split(Regex("\\s+")).last()
}
