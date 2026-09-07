package com.example.auth.application.query

import com.example.auth.application.dto.UserDto

interface FindUserByEmailQuery {
    suspend fun findByEmail(email: String): UserDto?
}