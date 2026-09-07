package com.example.auth.domain.provider

interface PasswordCryptoProvider {
    suspend fun hash(plainPassword: String): String
    suspend fun compare(plainPassword: String, hashedPassword: String): Boolean
}