package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertTrue

class DescriptionTest {

    @Test
    fun `should create description with valid text`() {
        val text = "This is a valid description text."
        val result = Description.tryCreate(text)
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should fail when text is too short`() {
        val result = Description.tryCreate("Short")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == Description.TOO_SHORT)
    }

    @Test
    fun `should fail when text exceeds max length`() {
        val result = Description.tryCreate("a".repeat(2001))
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == Description.TOO_LONG)
    }

    @Test
    fun `should accept text at exactly 20 characters`() {
        val result = Description.tryCreate("a".repeat(20))
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should accept text at exactly 2000 characters`() {
        val result = Description.tryCreate("a".repeat(2000))
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should allow custom min and max`() {
        val result = Description.tryCreate("abc", minLength = 3, maxLength = 10)
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should throw on create with invalid text`() {
        assertThrows<IllegalArgumentException> { Description.create("too short") }
    }
}
