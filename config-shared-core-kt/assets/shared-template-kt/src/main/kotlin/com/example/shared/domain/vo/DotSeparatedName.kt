package com.example.shared.domain.vo

import java.text.Normalizer

@JvmInline
value class DotSeparatedName private constructor(val value: String) {
    companion object {
        const val INVALID_DOT_SEPARATED_NAME = "INVALID_DOT_SEPARATED_NAME"
        private val PATTERN = Regex("^[a-z0-9]+(\\.[a-z0-9]+)*$")

        fun create(value: String): DotSeparatedName =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): Result<DotSeparatedName> {
            val normalized = normalize(value)
            if (!PATTERN.matches(normalized)) {
                return Result.failure(IllegalArgumentException(INVALID_DOT_SEPARATED_NAME))
            }
            return Result.success(DotSeparatedName(normalized))
        }

        fun normalize(value: String): String =
            Normalizer.normalize(value.lowercase().trim(), Normalizer.Form.NFD)
                .replace(Regex("[\\u0300-\\u036f]"), "")
                .replace(Regex("\\s+"), ".")
                .replace(Regex("\\.+"), ".")
                .replace(Regex("^\\.|\\.$"), "")
    }
}
