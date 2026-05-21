# Android Entity Pattern (Kotlin puro + sealed Failure + kotlin.Result)

## Failures (domain/model/CustomerFailure.kt)

```kotlin
sealed class CustomerFailure(message: String) : Exception(message) {
    class NotFound(val id: String) : CustomerFailure("Customer not found: $id")
    class DuplicateEmail(val email: String) : CustomerFailure("Email already registered: $email")
    class InvalidData(val field: String, val reason: String) : CustomerFailure("Invalid $field: $reason")
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
            val trimmedName = name.trim()
            if (trimmedName.length < 2) {
                return Result.failure(CustomerFailure.InvalidData("name", "Minimum 2 characters"))
            }

            val trimmedEmail = email.trim().lowercase()
            if (!trimmedEmail.contains('@') || !trimmedEmail.contains('.')) {
                return Result.failure(CustomerFailure.InvalidData("email", "Invalid format"))
            }

            val cleanCpf = cpf.replace(Regex("\\D"), "")
            if (cleanCpf.length != 11) {
                return Result.failure(CustomerFailure.InvalidData("cpf", "Must have 11 digits"))
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

- [ ] `sealed class <Bc>Failure : Exception()` com variantes específicas
- [ ] Construtor privado ou `data class` com companion `create()`
- [ ] `create()` retorna `kotlin.Result<T>` — nunca `throw`
- [ ] Validações de formato no `create()` (nome, email, cpf)
- [ ] `data class` para igualdade automática
- [ ] Sem dependências Android/Hilt na entidade
