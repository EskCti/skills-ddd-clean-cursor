package com.example.shared.domain.vo

open class Text private constructor(val value: String) {

    companion object {
        const val TOO_SHORT = "TEXT_TOO_SHORT"
        const val TOO_LONG = "TEXT_TOO_LONG"

        open val defaultMinLength: Int = 1
        open val defaultMaxLength: Int = Int.MAX_VALUE

        fun create(
            text: String,
            minLength: Int = defaultMinLength,
            maxLength: Int = defaultMaxLength
        ): Text = tryCreate(text, minLength, maxLength).getOrThrow()

        fun tryCreate(
            text: String,
            minLength: Int = defaultMinLength,
            maxLength: Int = defaultMaxLength
        ): Result<Text> = tryCreateInternal(text, minLength, maxLength) { v -> Text(v) }

        internal fun <T> tryCreateInternal(
            text: String,
            minLength: Int,
            maxLength: Int,
            tooShortMsg: String = TOO_SHORT,
            tooLongMsg: String = TOO_LONG,
            factory: (String) -> T
        ): Result<T> {
            val trimmed = text.trim()
            if (trimmed.length < minLength) {
                return Result.failure(IllegalArgumentException(tooShortMsg))
            }
            if (trimmed.length > maxLength) {
                return Result.failure(IllegalArgumentException(tooLongMsg))
            }
            return Result.success(factory(trimmed))
        }
    }

    override fun equals(other: Any?): Boolean =
        other is Text && other.value == this.value

    override fun hashCode(): Int = value.hashCode()

    override fun toString(): String = value
}
