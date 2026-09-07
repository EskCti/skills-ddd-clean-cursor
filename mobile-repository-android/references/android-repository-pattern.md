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
    suspend fun delete(@Path("id") id: String)
}
```

## RepositoryImpl (data) — features/customers/data/repository/CustomerRepositoryImpl.kt

```kotlin
import javax.inject.Inject
import java.io.IOException
import retrofit2.HttpException
import com.google.gson.JsonParser

class CustomerRepositoryImpl @Inject constructor(
    private val api: CustomerApiService,
) : ICustomerRepository {

    override suspend fun findAll(): Result<List<Customer>> = runCatching {
        api.findAll().mapNotNull { dto ->
            dto.toDomain().getOrNull()
        }
    }.recoverWith { e ->
        when (e) {
            is HttpException -> mapHttpError(e)
            is IOException ->
                Result.failure(CustomerFailure.InvalidData("network", "No internet connection"))
            else ->
                Result.failure(CustomerFailure.InvalidData("server", e.message ?: "Unknown error"))
        }
    }

    override suspend fun findById(id: String): Result<Customer> = runCatching {
        api.findById(id).toDomain().getOrThrow()
    }.recoverWith { e ->
        when (e) {
            is HttpException -> mapHttpError(e, id = id)
            is IOException ->
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
        when (e) {
            is HttpException -> mapHttpError(e, email = customer.email)
            else -> Result.failure(CustomerFailure.InvalidData("server", e.message ?: "Unknown"))
        }
    }

    override suspend fun update(customer: Customer): Result<Customer> = runCatching {
        api.update(customer.id, CustomerDto.fromDomain(customer)).toDomain().getOrThrow()
    }.recoverWith { e ->
        when (e) {
            is HttpException -> mapHttpError(e, email = customer.email)
            else -> Result.failure(CustomerFailure.InvalidData("server", e.message ?: "Unknown"))
        }
    }

    override suspend fun delete(id: String): Result<Unit> = runCatching {
        api.delete(id)
        Unit
    }.recoverWith { e ->
        when (e) {
            is HttpException -> mapHttpError(e, id = id)
            else -> Result.failure(CustomerFailure.InvalidData("server", e.message ?: "Unknown"))
        }
    }
}

// Lê o status code + `{ errors: [...] }` do corpo de erro, preservando a lista completa
private fun <T> mapHttpError(e: HttpException, id: String? = null, email: String? = null): Result<T> {
    val messages = parseErrorMessages(e)
    return when (e.code()) {
        404 -> Result.failure(CustomerFailure.NotFound(id ?: "", messages))
        409 -> Result.failure(CustomerFailure.DuplicateEmail(email ?: "", messages))
        else -> Result.failure(CustomerFailure.InvalidData("server", "HTTP ${e.code()}", messages))
    }
}

private fun parseErrorMessages(e: HttpException): List<String> {
    val status = e.code()
    val raw = e.response()?.errorBody()?.string()
    if (raw.isNullOrBlank()) return listOf("HTTP $status")
    return runCatching {
        val json = JsonParser.parseString(raw).asJsonObject
        val errors = json.get("errors")
        if (errors != null && errors.isJsonArray) {
            errors.asJsonArray.map { it.asString }
        } else {
            val message = json.get("message")
            listOf(message?.asString ?: "HTTP $status")
        }
    }.getOrDefault(listOf("HTTP $status"))
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
- [ ] `recoverWith {}` mapeia `HttpException` via status code (404→NotFound, 409→DuplicateEmail) e propaga `errors` do body como `List<String>`
- [ ] `RepositoryModule` com `@Binds` para Hilt
