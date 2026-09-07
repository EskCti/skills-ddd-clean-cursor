package com.example.auth.application.query

import com.example.auth.application.dto.UserDto

interface FindUserByIdQuery {
    suspend fun findById(id: String): UserDto?
}