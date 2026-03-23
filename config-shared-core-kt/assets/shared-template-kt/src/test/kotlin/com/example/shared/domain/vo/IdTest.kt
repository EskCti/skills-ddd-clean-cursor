package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class IdTest {

    @Test
    fun `should create id with generated UUID when no value provided`() {
        val id = Id.create()
        assertNotNull(id.value)
        assertTrue(id.value.matches(Regex("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")))
    }

    @Test
    fun `should create id with given valid UUID`() {
        val uuid = "550e8400-e29b-41d4-a716-446655440000"
        val id = Id.create(uuid)
        assertEquals(uuid, id.value)
    }

    @Test
    fun `should fail for invalid UUID`() {
        val result = Id.tryCreate("not-a-uuid")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should throw on create with invalid value`() {
        assertThrows<IllegalArgumentException> { Id.create("invalid") }
    }

    @Test
    fun `required should fail for blank value`() {
        val result = Id.required("")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should generate UUID when value is blank`() {
        val id = Id.create("")
        assertNotNull(id.value)
    }
}
