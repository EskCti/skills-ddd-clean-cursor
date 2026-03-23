package com.example.modules.auth

import com.example.auth.application.usecase.CreateUserInput
import com.example.auth.application.usecase.CreateUserUseCase
import com.example.auth.user.usecase.DeleteUserUseCase
import com.example.auth.user.usecase.FindByEmailUseCase
import com.example.auth.user.usecase.FindByIdUseCase
import com.example.auth.user.usecase.LoginUseCase
import com.example.auth.password.usecase.ChangePasswordInput
import com.example.auth.password.usecase.ChangePasswordUseCase
import com.example.modules.auth.dto.AuthResponse
import com.example.modules.auth.dto.ChangePasswordRequest
import com.example.modules.auth.dto.LoginRequest
import com.example.modules.auth.dto.RegisterRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class AuthController(
    private val createUser: CreateUserUseCase,
    private val loginUseCase: LoginUseCase,
    private val findById: FindByIdUseCase,
    private val findByEmail: FindByEmailUseCase,
    private val deleteUser: DeleteUserUseCase,
    private val changePassword: ChangePasswordUseCase,
    private val jwtTokenProvider: JwtTokenProvider
) {

    @PostMapping("/register")
    suspend fun register(@RequestBody body: RegisterRequest): ResponseEntity<Any> {
        val result = createUser.execute(
            CreateUserInput(name = body.name, email = body.email, password = body.password)
        )
        return result.fold(
            onSuccess = { user -> ResponseEntity.status(HttpStatus.CREATED).body(mapOf("id" to user.id.value)) },
            onFailure = { e -> ResponseEntity.badRequest().body(mapOf("error" to e.message)) }
        )
    }

    @PostMapping("/login")
    suspend fun login(@RequestBody body: LoginRequest): ResponseEntity<Any> {
        val result = loginUseCase.execute(body.email, body.password)
        return result.fold(
            onSuccess = { user ->
                val token = jwtTokenProvider.generateToken(user.id, user.email)
                ResponseEntity.ok(AuthResponse(token = token, userId = user.id))
            },
            onFailure = { e -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message)) }
        )
    }

    @GetMapping("/me")
    suspend fun me(): ResponseEntity<Any> {
        val userId = SecurityContextHolder.getContext().authentication?.name
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        val result = findById.execute(userId)
        return result.fold(
            onSuccess = { user -> ResponseEntity.ok(user) },
            onFailure = { e -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message)) }
        )
    }

    @GetMapping("/users/{id}")
    @RequireAdmin
    suspend fun getUserById(@PathVariable id: String): ResponseEntity<Any> {
        val result = findById.execute(id)
        return result.fold(
            onSuccess = { user -> ResponseEntity.ok(user) },
            onFailure = { e -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message)) }
        )
    }

    @DeleteMapping("/users/{id}")
    @RequireAdmin
    suspend fun deleteUserById(@PathVariable id: String): ResponseEntity<Any> {
        val result = deleteUser.execute(id)
        return result.fold(
            onSuccess = { ResponseEntity.noContent().build() },
            onFailure = { e -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message)) }
        )
    }

    @PostMapping("/change-password")
    suspend fun changePasswordEndpoint(@RequestBody body: ChangePasswordRequest): ResponseEntity<Any> {
        val userId = SecurityContextHolder.getContext().authentication?.name
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        val result = changePassword.execute(ChangePasswordInput(userId = userId, newPlainPassword = body.newPassword))
        return result.fold(
            onSuccess = { ResponseEntity.ok(mapOf("message" to "Password changed")) },
            onFailure = { e -> ResponseEntity.badRequest().body(mapOf("error" to e.message)) }
        )
    }
}
