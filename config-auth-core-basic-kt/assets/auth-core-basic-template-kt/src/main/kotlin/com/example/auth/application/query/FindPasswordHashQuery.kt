package com.example.auth.application.query

interface FindPasswordHashQuery {
    suspend fun findPasswordHash(userId: String): String?
}