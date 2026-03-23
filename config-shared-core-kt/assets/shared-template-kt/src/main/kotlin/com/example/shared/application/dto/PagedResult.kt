package com.example.shared.application.dto

data class PaginatedInput(
    val page: Int = 1,
    val pageSize: Int = 20
)

data class PaginationMeta(
    val page: Int,
    val pageSize: Int,
    val total: Long,
    val totalPages: Int
)

data class PagedResult<T>(
    val data: List<T>,
    val meta: PaginationMeta
) {
    companion object {
        fun <T> of(
            items: List<T>,
            total: Long,
            page: Int,
            pageSize: Int
        ): PagedResult<T> = PagedResult(
            data = items,
            meta = PaginationMeta(
                page = page,
                pageSize = pageSize,
                total = total,
                totalPages = if (pageSize > 0) ((total + pageSize - 1) / pageSize).toInt() else 0
            )
        )
    }
}
