package com.example.shared.domain.vo

@JvmInline
value class ShortDescription private constructor(val value: String) {
    companion object {
        const val TOO_SHORT = "SHORT_DESCRIPTION_TOO_SHORT"
        const val TOO_LONG = "SHORT_DESCRIPTION_TOO_LONG"
        const val DEFAULT_MIN_LENGTH = 15
        const val DEFAULT_MAX_LENGTH = 80

        fun create(
            text: String,
            minLength: Int = DEFAULT_MIN_LENGTH,
            maxLength: Int = DEFAULT_MAX_LENGTH
        ): ShortDescription = tryCreate(text, minLength, maxLength).getOrThrow()

        fun tryCreate(
            text: String,
            minLength: Int = DEFAULT_MIN_LENGTH,
            maxLength: Int = DEFAULT_MAX_LENGTH
        ): Result<ShortDescription> =
            Text.tryCreateInternal(text, minLength, maxLength, TOO_SHORT, TOO_LONG) { v -> ShortDescription(v) }
    }
}
