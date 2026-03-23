package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class UrlTest {

    @Test
    fun `should create url with valid https`() {
        val url = Url.create("https://example.com")
        assertEquals("https://example.com", url.value)
    }

    @Test
    fun `should create url with valid http`() {
        val result = Url.tryCreate("http://localhost:3000/api")
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should trim whitespace`() {
        val url = Url.create("  https://example.com  ")
        assertEquals("https://example.com", url.value)
    }

    @Test
    fun `should fail for invalid url`() {
        val result = Url.tryCreate("not a url")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == Url.INVALID_URL)
    }

    @Test
    fun `should fail for url without scheme`() {
        val result = Url.tryCreate("example.com")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should throw on create with invalid url`() {
        assertThrows<IllegalArgumentException> { Url.create("invalid") }
    }
}
