package com.example.shared.application.dto

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class PagedResultTest {

    @Test
    fun `should create paged result with correct meta`() {
        val result = PagedResult.of(
            items = listOf("a", "b", "c"),
            total = 10,
            page = 1,
            pageSize = 3
        )

        assertEquals(3, result.data.size)
        assertEquals(1, result.meta.page)
        assertEquals(3, result.meta.pageSize)
        assertEquals(10, result.meta.total)
        assertEquals(4, result.meta.totalPages)
    }

    @Test
    fun `should calculate total pages correctly for exact division`() {
        val result = PagedResult.of(
            items = emptyList<String>(),
            total = 20,
            page = 1,
            pageSize = 10
        )

        assertEquals(2, result.meta.totalPages)
    }

    @Test
    fun `should calculate total pages correctly with remainder`() {
        val result = PagedResult.of(
            items = emptyList<String>(),
            total = 21,
            page = 1,
            pageSize = 10
        )

        assertEquals(3, result.meta.totalPages)
    }

    @Test
    fun `should handle zero total`() {
        val result = PagedResult.of(
            items = emptyList<String>(),
            total = 0,
            page = 1,
            pageSize = 10
        )

        assertEquals(0, result.meta.totalPages)
        assertEquals(0, result.meta.total)
    }

    @Test
    fun `should handle zero page size without error`() {
        val result = PagedResult.of(
            items = emptyList<String>(),
            total = 10,
            page = 1,
            pageSize = 0
        )

        assertEquals(0, result.meta.totalPages)
    }
}
