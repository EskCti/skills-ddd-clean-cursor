package com.example.auth.application.usecase

import com.example.auth.application.query.UserExistsQuery
import com.example.auth.password.entity.Password
import com.example.auth.password.provider.PasswordCryptoProvider
import com.example.auth.password.repository.PasswordRepository
import com.example.auth.user.entity.User
import com.example.auth.user.repository.UserRepository
import com.example.shared.application.UseCase
import com.example.shared.infrastructure.TransactionManager

data class CreateUserInput(
    val name: String,
    val email: String,
    val password: String,
    val admin: Boolean = false,
    val avatarUrl: String? = null
)

class CreateUserUseCase(
    private val userRepository: UserRepository,
    private val passwordRepository: PasswordRepository,
    private val userExists: UserExistsQuery,
    private val crypto: PasswordCryptoProvider,
    private val transactionManager: TransactionManager
) : UseCase<CreateUserInput, User> {
    override suspend fun execute(data: CreateUserInput): Result<User> {
        if (userExists.existsByEmail(data.email)) {
            return Result.failure(IllegalArgumentException("USER_ALREADY_EXISTS"))
        }

        val user = User.tryCreate(
            name = data.name,
            email = data.email,
            admin = data.admin,
            avatarUrl = data.avatarUrl
        ).getOrElse { return Result.failure(it) }

        val hash = crypto.hash(data.password)
        val password = Password.create(userId = user.id.value, hash = hash)

        return transactionManager.runInTransaction {
            userRepository.create(user).getOrThrow()
            passwordRepository.create(password).getOrThrow()
            Result.success(user)
        }
    }
}
