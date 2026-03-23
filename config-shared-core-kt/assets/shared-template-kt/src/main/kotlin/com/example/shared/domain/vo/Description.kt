package com.example.shared.domain.vo

@JvmInline
value class Description private constructor(val value: String) {
    companion object {
        const val TOO_SHORT = "DESCRIPTION_TOO_SHORT"
        const val TOO_LONG = "DESCRIPTION_TOO_LONG"
        const val DEFAULT_MIN_LENGTH = 20
        const val DEFAULT_MAX_LENGTH = 2000

        fun create(
            text: String,
            minLength: Int = DEFAULT_MIN_LENGTH,
            maxLength: Int = DEFAULT_MAX_LENGTH
        ): Description = tryCreate(text, minLength, maxLength).getOrThrow()

        fun tryCreate(
            text: String,
            minLength: Int = DEFAULT_MIN_LENGTH,
            maxLength: Int = DEFAULT_MAX_LENGTH
        ): Result<Description> =
            Text.tryCreateInternal(text, minLength, maxLength, TOO_SHORT, TOO_LONG) { v -> Description(v) }
    }
}
