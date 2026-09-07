package com.example.modules.auth

import com.example.auth.application.usecase.ChangePasswordInput
import com.example.auth.application.usecase.ChangePasswordUseCase
import com.example.auth.application.usecase.CreateUserInput
import com.example.auth.application.usecase.CreateUserUseCase
import com.example.auth.application.usecase.DeleteUserUseCase
import com.example.auth.application.usecase.FindByEmailUseCase
import com.example.auth.application.usecase.FindByIdUseCase
import com.example.auth.application.usecase.LoginUseCase
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
        if (result.isFailure) {
            return ResponseEntity.badRequest().body(mapOf("errors" to result.errors))
        }
        val user = result.value!!
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("id" to user.id.value))
    }

    @PostMapping("/login")
    suspend fun login(@RequestBody body: LoginRequest): ResponseEntity<Any> {
        val result = loginUseCase.execute(body.email, body.password)
        if (result.isFailure) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("errors" to result.errors))
        }
        val user = result.value!!
        val token = jwtTokenProvider.generateToken(user.id, user.email)
        return ResponseEntity.ok(AuthResponse(token = token, userId = user.id))
    }

    @GetMapping("/me")
    suspend fun me(): ResponseEntity<Any> {
        val userId = SecurityContextHolder.getContext().authentication?.name
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        val result = findById.execute(userId)
        if (result.isFailure) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("errors" to result.errors))
        }
        return ResponseEntity.ok(result.value)
    }

    @GetMapping("/users/{id}")
    @RequireAdmin
    suspend fun getUserById(@PathVariable id: String): ResponseEntity<Any> {
        val result = findById.execute(id)
        if (result.isFailure) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("errors" to result.errors))
        }
        return ResponseEntity.ok(result.value)
    }

    @DeleteMapping("/users/{id}")
    @RequireAdmin
    suspend fun deleteUserById(@PathVariable id: String): ResponseEntity<Any> {
        val result = deleteUser.execute(id)
        if (result.isFailure) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("errors" to result.errors))
        }
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/change-password")
    suspend fun changePasswordEndpoint(@RequestBody body: ChangePasswordRequest): ResponseEntity<Any> {
        val userId = SecurityContextHolder.getContext().authentication?.name
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        val result = changePassword.execute(ChangePasswordInput(userId = userId, newPlainPassword = body.newPassword))
        if (result.isFailure) {
            return ResponseEntity.badRequest().body(mapOf("errors" to result.errors))
        }
        return ResponseEntity.ok(mapOf("message" to "Password changed"))
    }
}