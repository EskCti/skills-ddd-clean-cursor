# Android Repository Pattern (Interface + Retrofit + Result)

## Interface (domain) — features/customers/domain/repository/ICustomerRepository.kt

```kotlin
interface ICustomerRepository {
    suspend fun findAll(): Result<List<Customer>>
    suspend fun findById(id: String): Result<Customer>
    suspend fun findByEmail(email: String): Result<Customer?>
    suspend fun create(customer: Customer): Result<Customer>
    suspend fun update(customer: Customer): Result<Customer>
    suspend fun delete(id: String): Result<Unit>
}
```

## DTO (data) — features/customers/data/remote/CustomerDto.kt

```kotlin
import com.google.gson.annotations.SerializedName

data class CustomerDto(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("cpf") val cpf: String,
    @SerializedName("is_active") val isActive: Boolean,
) {
    fun toDomain(): Result<Customer> = Customer.create(
        id = id, name = name, email = email, cpf = cpf,
    )

    companion object {
        fun fromDomain(customer: Customer) = CustomerDto(
            id = customer.id,
            name = customer.name,
            email = customer.email,
            cpf = customer.cpf,
            isActive = customer.isActive,
        )
    }
}
```

## ApiService (data) — features/customers/data/remote/CustomerApiService.kt

```kotlin
import retrofit2.Response
import retrofit2.http.*

interface CustomerApiService {
    @GET("customers")
    suspend fun findAll(): List<CustomerDto>

    @GET("customers/{id}")
    suspend fun findById(@Path("id") id: String): CustomerDto

    @POST("customers")
    suspend fun create(@Body dto: CustomerDto): CustomerDto

    @PUT("customers/{id}")
    suspend fun update(@Path("id") id: String, @Body dto: CustomerDto): CustomerDto

    @DELETE("customers/{id}")
    suspend fun delete(@Path("id") id: String): Response<Unit>
}
```

## RepositoryImpl (data) — features/customers/data/repository/CustomerRepositoryImpl.kt

```kotlin
import javax.inject.Inject
import java.io.IOException

class CustomerRepositoryImpl @Inject constructor(
    private val api: CustomerApiService,
) : ICustomerRepository {

    override suspend fun findAll(): Result<List<Customer>> = runCatching {
        api.findAll().mapNotNull { dto ->
            dto.toDomain().getOrNull()
        }
    }.recoverWith { e ->
        Result.failure(CustomerFailure.InvalidData("network", e.message ?: "Unknown error"))
    }

    override suspend fun findById(id: String): Result<Customer> = runCatching {
        api.findById(id).toDomain().getOrThrow()
    }.recoverWith { e ->
        when {
            e.message?.contains("404") == true ->
                Result.failure(CustomerFailure.NotFound(id))
            e is IOException ->
                Result.failure(CustomerFailure.InvalidData("network", "No internet connection"))
            else ->
                Result.failure(CustomerFailure.InvalidData("server", e.message ?: "Unknown"))
        }
    }

    override suspend fun findByEmail(email: String): Result<Customer?> = runCatching {
        api.findAll().firstOrNull { it.email == email }?.toDomain()?.getOrNull()
    }

    override suspend fun create(customer: Customer): Result<Customer> = runCatching {
        api.create(CustomerDto.fromDomain(customer)).toDomain().getOrThrow()
    }.recoverWith { e ->
        when {
            e.message?.contains("409") == true ->
                Result.failure(CustomerFailure.DuplicateEmail(customer.email))
            else ->
                Result.failure(CustomerFailure.InvalidData("server", e.message ?: "Unknown"))
        }
    }

    override suspend fun update(customer: Customer): Result<Customer> = runCatching {
        api.update(customer.id, CustomerDto.fromDomain(customer)).toDomain().getOrThrow()
    }

    override suspend fun delete(id: String): Result<Unit> = runCatching {
        api.delete(id)
        Unit
    }
}

// Extension para encadear recuperação
private fun <T> Result<T>.recoverWith(block: (Throwable) -> Result<T>): Result<T> =
    if (isFailure) block(exceptionOrNull()!!) else this
```

## DI Module — core/di/RepositoryModule.kt

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindCustomerRepository(
        impl: CustomerRepositoryImpl
    ): ICustomerRepository
}
```

## Checklist

- [ ] `ICustomerRepository` em domain/ (Kotlin puro, sem Retrofit)
- [ ] `CustomerDto` com `toDomain()` e `fromDomain()` (mapeamento ↔ entidade)
- [ ] `CustomerApiService` (Retrofit @GET/@POST/@PUT/@DELETE)
- [ ] `CustomerRepositoryImpl @Inject` com `runCatching {}` em todos os métodos
- [ ] `recoverWith {}` para mapear exceções em Failure específicos
- [ ] `RepositoryModule` com `@Binds` para Hilt
