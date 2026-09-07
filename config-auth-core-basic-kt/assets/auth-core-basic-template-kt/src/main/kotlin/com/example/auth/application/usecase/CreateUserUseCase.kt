package com.example.auth.application.usecase

import com.example.auth.application.query.UserExistsQuery
import com.example.auth.domain.entity.Password
import com.example.auth.domain.entity.User
import com.example.auth.domain.provider.PasswordCryptoProvider
import com.example.auth.domain.repository.PasswordRepository
import com.example.auth.domain.repository.UserRepository
import com.example.shared.application.UseCase
import com.example.shared.domain.result.DomainResult
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
    override suspend fun execute(data: CreateUserInput): DomainResult<User> {
        if (userExists.existsByEmail(data.email)) {
            return DomainResult.failure(listOf("USER_ALREADY_EXISTS"))
        }

        val userResult = User.tryCreate(
            name = data.name,
            email = data.email,
            admin = data.admin,
            avatarUrl = data.avatarUrl
        )
        if (userResult.isFailure) {
            return userResult
        }
        val user = userResult.value!!

        val hash = crypto.hash(data.password)
        val password = Password.create(userId = user.id.value, hash = hash)

        val results = transactionManager.runInTransaction {
            listOf(
                userRepository.create(user),
                passwordRepository.create(password)
            )
        }

        val errors = results.flatMap { it.errors }
        if (errors.isNotEmpty()) {
            return DomainResult.failure(errors)
        }

        return DomainResult.success(user)
    }
}