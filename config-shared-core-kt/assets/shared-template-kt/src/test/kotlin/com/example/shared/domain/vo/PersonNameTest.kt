package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PersonNameTest {

    @Test
    fun `should create person name with first and last name`() {
        val name = PersonName.create("John Doe")
        assertEquals("John Doe", name.value)
    }

    @Test
    fun `should extract first name`() {
        val name = PersonName.create("John Doe")
        assertEquals("John", name.firstName)
    }

    @Test
    fun `should extract last name`() {
        val name = PersonName.create("John William Doe")
        assertEquals("Doe", name.lastName)
    }

    @Test
    fun `should trim whitespace`() {
        val name = PersonName.create("  John Doe  ")
        assertEquals("John Doe", name.value)
    }

    @Test
    fun `should fail when name is too short`() {
        val result = PersonName.tryCreate("AB")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == PersonName.TOO_SHORT)
    }

    @Test
    fun `should fail when name exceeds 50 characters`() {
        val result = PersonName.tryCreate("A".repeat(30) + " " + "B".repeat(21))
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == PersonName.TOO_LONG)
    }

    @Test
    fun `should fail when name has only first name`() {
        val result = PersonName.tryCreate("John")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message == PersonName.MUST_HAVE_FIRST_AND_LAST_NAME)
    }

    @Test
    fun `should accept name with multiple words`() {
        val result = PersonName.tryCreate("Maria da Silva Santos")
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should throw on create with single name`() {
        assertThrows<IllegalArgumentException> { PersonName.create("John") }
    }
}
