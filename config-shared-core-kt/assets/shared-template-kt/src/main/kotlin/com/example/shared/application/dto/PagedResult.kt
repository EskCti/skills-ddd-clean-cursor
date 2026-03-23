package com.example.shared.application.dto

data class PagedResult<T>(
    val items: List<T>,
    val total: Long,
    val page: Int,
    val pageSize: Int
)
