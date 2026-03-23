package com.example.shared.domain.vo

@JvmInline
value class StrongPassword private constructor(val value: String) {
    companion object {
        const val WEAK_PASSWORD = "WEAK_PASSWORD"
        private const val MIN_LENGTH = 8

        fun create(value: String): StrongPassword =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): Result<StrongPassword> {
            if (value.length < MIN_LENGTH) {
                return Result.failure(IllegalArgumentException(WEAK_PASSWORD))
            }
            if (!value.any { it.isUpperCase() }) {
                return Result.failure(IllegalArgumentException(WEAK_PASSWORD))
            }
            if (!value.any { it.isLowerCase() }) {
                return Result.failure(IllegalArgumentException(WEAK_PASSWORD))
            }
            if (!value.any { it.isDigit() }) {
                return Result.failure(IllegalArgumentException(WEAK_PASSWORD))
            }
            if (!value.any { !it.isLetterOrDigit() }) {
                return Result.failure(IllegalArgumentException(WEAK_PASSWORD))
            }
            return Result.success(StrongPassword(value))
        }
    }
}
