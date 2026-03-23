package com.example.auth.password.provider

interface PasswordCryptoProvider {
    suspend fun hash(plainPassword: String): String
    suspend fun compare(plainPassword: String, hashedPassword: String): Boolean
}
