package com.example.auth.user.dto

data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    val admin: Boolean,
    val avatarUrl: String?
)
