package com.example.auth.application.dto

data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    val admin: Boolean,
    val avatarUrl: String?
)