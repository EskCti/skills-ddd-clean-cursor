package com.example.auth.user.query

import com.example.auth.user.dto.UserDto

interface FindUserByIdQuery {
    suspend fun findById(id: String): UserDto?
}
