package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertTrue

class ShortDescriptionTest {

    @Test
    fun `should create short description with valid text`() {
        val result = ShortDescription.tryCreate("A short description.")
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should fail when text is too short`() {
        val result = ShortDescription.tryCreate("Too short")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == ShortDescription.TOO_SHORT)
    }

    @Test
    fun `should fail when text exceeds 80 characters`() {
        val result = ShortDescription.tryCreate("a".repeat(81))
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == ShortDescription.TOO_LONG)
    }

    @Test
    fun `should accept text at exactly 15 characters`() {
        val result = ShortDescription.tryCreate("a".repeat(15))
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should accept text at exactly 80 characters`() {
        val result = ShortDescription.tryCreate("a".repeat(80))
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should throw on create with invalid text`() {
        assertThrows<IllegalArgumentException> { ShortDescription.create("tiny") }
    }
}
