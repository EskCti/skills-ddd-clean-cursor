package com.example.auth.user.query

import com.example.auth.user.dto.UserDto

interface FindUserByEmailQuery {
    suspend fun findByEmail(email: String): UserDto?
}
