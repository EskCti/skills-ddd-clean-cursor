package com.example.auth.user.query

interface FindPasswordHashQuery {
    suspend fun findPasswordHash(userId: String): String?
}
