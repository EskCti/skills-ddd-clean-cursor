# Android UseCase Pattern (Kotlin + Coroutines + Result)

## Base UseCase (core/usecase/UseCase.kt)

```kotlin
interface UseCase<in Params, out R> {
    suspend operator fun invoke(params: Params): Result<R>
}

object NoParams
```

## CreateCustomerUseCase (features/customers/application/usecase/CreateCustomerUseCase.kt)

```kotlin
import javax.inject.Inject

data class CreateCustomerParams(
    val name: String,
    val email: String,
    val cpf: String,
)

class CreateCustomerUseCase @Inject constructor(
    private val repository: ICustomerRepository,
) : UseCase<CreateCustomerParams, Customer> {

    override suspend operator fun invoke(params: CreateCustomerParams): Result<Customer> {
        // 1. Validar no domínio
        val customerResult = Customer.create(
            id = java.util.UUID.randomUUID().toString(),
            name = params.name,
            email = params.email,
            cpf = params.cpf,
        )
        if (customerResult.isFailure) return customerResult

        val customer = customerResult.getOrThrow()

        // 2. Regra de negócio: email único
        val existsResult = repository.findByEmail(params.email)
        if (existsResult.isSuccess && existsResult.getOrNull() != null) {
            return Result.failure(CustomerFailure.DuplicateEmail(params.email))
        }

        // 3. Persistir
        return repository.create(customer)
    }
}
```

## GetCustomersUseCase

```kotlin
class GetCustomersUseCase @Inject constructor(
    private val repository: ICustomerRepository,
) : UseCase<NoParams, List<Customer>> {

    override suspend operator fun invoke(params: NoParams): Result<List<Customer>> =
        repository.findAll()
}
```

## Checklist

- [ ] `interface UseCase<in Params, out R>` base criado
- [ ] `data class Params` por use case (ou `NoParams`)
- [ ] `@Inject constructor(private val repo: IRepository)` para Hilt
- [ ] `invoke()` retorna `Result<R>` — sem throw não tratado
- [ ] Validações de domínio delegadas à entidade (`Customer.create()`)
- [ ] Regras de negócio (email único, limites, etc.) verificadas antes de persistir
