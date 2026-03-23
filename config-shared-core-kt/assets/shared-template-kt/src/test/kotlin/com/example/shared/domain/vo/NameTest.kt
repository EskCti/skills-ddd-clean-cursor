package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class NameTest {

    @Test
    fun `should create name with trimmed value`() {
        val name = Name.create("  John Doe  ")
        assertEquals("John Doe", name.value)
    }

    @Test
    fun `should fail for blank name`() {
        val result = Name.tryCreate("   ")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail for name exceeding 255 characters`() {
        val longName = "a".repeat(256)
        val result = Name.tryCreate(longName)
        assertTrue(result.isFailure)
    }

    @Test
    fun `should accept name with exactly 255 characters`() {
        val maxName = "a".repeat(255)
        val result = Name.tryCreate(maxName)
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should throw on create with blank value`() {
        assertThrows<IllegalArgumentException> { Name.create("") }
    }
}
