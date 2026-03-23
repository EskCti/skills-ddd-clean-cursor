package com.example.auth.application.usecase

import com.example.auth.application.query.UserExistsQuery
import com.example.auth.password.entity.Password
import com.example.auth.password.provider.PasswordCryptoProvider
import com.example.auth.password.repository.PasswordRepository
import com.example.auth.user.entity.User
import com.example.auth.user.repository.UserRepository
import com.example.shared.infrastructure.TransactionManager
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class CreateUserUseCaseTest {

    private val fakeUserRepo = object : UserRepository {
        override suspend fun create(user: User) = Result.success(Unit)
        override suspend fun update(user: User) = Result.success(Unit)
        override suspend fun delete(id: String) = Result.success(Unit)
    }

    private val fakePasswordRepo = object : PasswordRepository {
        override suspend fun create(password: Password) = Result.success(Unit)
        override suspend fun findByUserId(userId: String): Password? = null
        override suspend fun findRecentByUserId(userId: String, limit: Int) = emptyList<Password>()
    }

    private val fakeCrypto = object : PasswordCryptoProvider {
        override suspend fun hash(plainPassword: String) =
            "\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        override suspend fun compare(plainPassword: String, hashedPassword: String) = false
    }

    private val fakeTx = object : TransactionManager {
        override suspend fun <T> runInTransaction(block: suspend () -> T): T = block()
    }

    @Test
    fun `should create user successfully`() = runBlocking {
        val userExists = object : UserExistsQuery {
            override suspend fun existsByEmail(email: String) = false
            override suspend fun existsById(id: String) = false
        }
        val useCase = CreateUserUseCase(fakeUserRepo, fakePasswordRepo, userExists, fakeCrypto, fakeTx)
        val result = useCase.execute(CreateUserInput(name = "John", email = "john@example.com", password = "Pass123!"))
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should fail when user already exists`() = runBlocking {
        val userExists = object : UserExistsQuery {
            override suspend fun existsByEmail(email: String) = true
            override suspend fun existsById(id: String) = false
        }
        val useCase = CreateUserUseCase(fakeUserRepo, fakePasswordRepo, userExists, fakeCrypto, fakeTx)
        val result = useCase.execute(CreateUserInput(name = "John", email = "john@example.com", password = "Pass123!"))
        assertTrue(result.isFailure)
    }
}
