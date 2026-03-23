package com.example.shared.domain.vo

import java.net.URI

@JvmInline
value class Url private constructor(val value: String) {
    companion object {
        const val INVALID_URL = "INVALID_URL"

        fun create(value: String): Url =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): Result<Url> {
            val trimmed = value.trim()
            return try {
                val uri = URI(trimmed)
                if (uri.scheme == null || uri.host == null) {
                    Result.failure(IllegalArgumentException(INVALID_URL))
                } else {
                    Result.success(Url(trimmed))
                }
            } catch (_: Exception) {
                Result.failure(IllegalArgumentException(INVALID_URL))
            }
        }
    }
}
