package com.example.shared.domain.vo

import com.example.shared.domain.result.DomainResult
import java.net.URI

@JvmInline
value class Url private constructor(val value: String) {
    companion object {
        const val INVALID_URL = "INVALID_URL"

        fun create(value: String): Url =
            tryCreate(value).getOrThrow()

        fun tryCreate(value: String): DomainResult<Url> {
            val trimmed = value.trim()
            return try {
                val uri = URI(trimmed)
                if (uri.scheme == null || uri.host == null) {
                    DomainResult.failure(INVALID_URL)
                } else {
                    DomainResult.success(Url(trimmed))
                }
            } catch (_: Exception) {
                DomainResult.failure(INVALID_URL)
            }
        }
    }
}
