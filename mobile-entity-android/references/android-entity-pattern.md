# Android Entity Pattern (Kotlin puro + sealed Failure + kotlin.Result)

## Failures (domain/model/CustomerFailure.kt)

```kotlin
sealed class CustomerFailure(message: String) : Exception(message) {
    /** Lista completa de mensagens (contrato §5.1) — nunca expor só a primeira. */
    abstract val errors: List<String>

    class NotFound(
        val id: String,
        override val errors: List<String> = listOf("Customer not found: $id"),
    ) : CustomerFailure(errors.firstOrNull() ?: "Customer not found: $id")

    class DuplicateEmail(
        val email: String,
        override val errors: List<String> = listOf("Email already registered: $email"),
    ) : CustomerFailure(errors.firstOrNull() ?: "Email already registered: $email")

    class InvalidData(
        val field: String,
        val reason: String,
        override val errors: List<String> = listOf("Invalid $field: $reason"),
    ) : CustomerFailure(errors.firstOrNull() ?: "Invalid $field: $reason")

    /** Falha de validação que acumula todas as mensagens do VO/entidade. */
    class Validation(
        override val errors: List<String>,
    ) : CustomerFailure(errors.joinToString("; "))
}
```

## Entidade com validação (domain/model/Customer.kt)

```kotlin
data class Customer(
    val id: String,
    val name: String,
    val email: String,
    val cpf: String,
    val isActive: Boolean = true,
) {
    companion object {
        fun create(
            id: String,
            name: String,
            email: String,
            cpf: String,
        ): Result<Customer> {
            val messages = mutableListOf<String>()

            val trimmedName = name.trim()
            if (trimmedName.length < 2) {
                messages += "Minimum 2 characters"
            }

            val trimmedEmail = email.trim().lowercase()
            if (!trimmedEmail.contains('@') || !trimmedEmail.contains('.')) {
                messages += "Invalid format"
            }

            val cleanCpf = cpf.replace(Regex("\\D"), "")
            if (cleanCpf.length != 11) {
                messages += "Must have 11 digits"
            }

            if (messages.isNotEmpty()) {
                return Result.failure(CustomerFailure.Validation(messages))
            }

            return Result.success(
                Customer(
                    id = id,
                    name = trimmedName,
                    email = trimmedEmail,
                    cpf = cleanCpf,
                )
            )
        }
    }

    fun deactivate(): Customer = copy(isActive = false)
    fun activate(): Customer = copy(isActive = true)
}
```

## Checklist

- [ ] `sealed class <Bc>Failure(message)` — estende `Exception` porque `kotlin.Result.failure()` exige `Throwable`, mas nunca é lançada via `throw`
- [ ] Cada variante expõe `errors: List<String>` — lista completa, nunca só a primeira
- [ ] Validações ACUMULAM mensagens em `List<String>` e retornam uma única `Result.failure(Validation(errors))`
- [ ] `create()` retorna `kotlin.Result<T>` — nunca `throw`
- [ ] Validações de formato no `create()` (nome, email, cpf)
- [ ] `data class` para igualdade automática
- [ ] Sem dependências Android/Hilt na entidade
