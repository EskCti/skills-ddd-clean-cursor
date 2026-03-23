package com.example.shared.domain.vo

@JvmInline
value class Name private constructor(val value: String) {
    companion object {
        private const val INVALID_NAME = "Name must not be blank and must have at most 255 characters"

        fun create(value: String): Name =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): Result<Name> {
            val normalized = value.trim()
            if (normalized.isBlank() || normalized.length > 255) {
                return Result.failure(IllegalArgumentException(INVALID_NAME))
            }
            return Result.success(Name(normalized))
        }
    }
}
