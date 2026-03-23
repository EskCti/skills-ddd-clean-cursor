package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TextTest {

    @Test
    fun `should create text with trimmed value`() {
        val text = Text.create("  hello world  ")
        assertEquals("hello world", text.value)
    }

    @Test
    fun `should create text with default min and max`() {
        val result = Text.tryCreate("a")
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should fail when text is shorter than min length`() {
        val result = Text.tryCreate("ab", minLength = 5)
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == Text.TOO_SHORT)
    }

    @Test
    fun `should fail when text exceeds max length`() {
        val result = Text.tryCreate("a".repeat(101), maxLength = 100)
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == Text.TOO_LONG)
    }

    @Test
    fun `should accept text at exact min length`() {
        val result = Text.tryCreate("abcde", minLength = 5)
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should accept text at exact max length`() {
        val result = Text.tryCreate("a".repeat(10), maxLength = 10)
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should throw on create with invalid value`() {
        assertThrows<IllegalArgumentException> { Text.create("", minLength = 1) }
    }

    @Test
    fun `should compare texts by value`() {
        val t1 = Text.create("same")
        val t2 = Text.create("same")
        assertEquals(t1, t2)
    }
}
