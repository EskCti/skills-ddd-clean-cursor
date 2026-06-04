package com.example.shared.domain.result

/**
 * Domain Result with always-list errors on failure (never a single opaque exception).
 */
data class DomainResult<out T>(
    val value: T?,
    val errors: List<String>,
) {
    val isSuccess: Boolean get() = errors.isEmpty()
    val isFailure: Boolean get() = errors.isNotEmpty()

    fun getOrThrow(): T =
        value ?: throw IllegalArgumentException(errors.joinToString("; "))

    companion object {
        fun <T> success(value: T): DomainResult<T> = DomainResult(value, emptyList())

        fun <T> failure(error: String): DomainResult<T> = failure(listOf(error))

        fun <T> failure(errors: List<String>): DomainResult<T> =
            DomainResult(null, errors.filter { it.isNotBlank() }.ifEmpty { listOf("VALIDATION_ERROR") })

        fun combine(vararg results: DomainResult<*>): DomainResult<Unit> {
            val errors = results.flatMap { it.errors }
            return if (errors.isNotEmpty()) failure(errors) else success(Unit)
        }
    }
}
