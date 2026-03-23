package com.example.shared.domain.vo

@JvmInline
value class Email private constructor(val value: String) {
    companion object {
        private const val INVALID_EMAIL = "Invalid email format"
        private val EMAIL_REGEX = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")

        fun create(value: String): Email =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): Result<Email> {
            val normalized = value.trim().lowercase()
            if (!EMAIL_REGEX.matches(normalized)) {
                return Result.failure(IllegalArgumentException(INVALID_EMAIL))
            }
            return Result.success(Email(normalized))
        }
    }

    val local: String get() = value.substringBefore('@')
    val domain: String get() = value.substringAfter('@')
}
