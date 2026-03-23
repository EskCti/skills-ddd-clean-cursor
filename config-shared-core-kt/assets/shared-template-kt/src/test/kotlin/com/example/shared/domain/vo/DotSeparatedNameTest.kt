package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class DotSeparatedNameTest {

    @Test
    fun `should create valid dot separated name`() {
        val name = DotSeparatedName.create("com.example.app")
        assertEquals("com.example.app", name.value)
    }

    @Test
    fun `should normalize spaces to dots`() {
        val name = DotSeparatedName.create("com example app")
        assertEquals("com.example.app", name.value)
    }

    @Test
    fun `should normalize to lowercase`() {
        val name = DotSeparatedName.create("COM.Example.APP")
        assertEquals("com.example.app", name.value)
    }

    @Test
    fun `should remove accents during normalization`() {
        val name = DotSeparatedName.create("módulo.ação")
        assertEquals("modulo.acao", name.value)
    }

    @Test
    fun `should collapse multiple dots`() {
        val name = DotSeparatedName.create("com..example...app")
        assertEquals("com.example.app", name.value)
    }

    @Test
    fun `should trim leading and trailing dots`() {
        val name = DotSeparatedName.create(".com.example.")
        assertEquals("com.example", name.value)
    }

    @Test
    fun `should fail for empty string after normalization`() {
        val result = DotSeparatedName.tryCreate("...")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail for string with invalid characters`() {
        val result = DotSeparatedName.tryCreate("com.ex@mple")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should accept single segment`() {
        val result = DotSeparatedName.tryCreate("app")
        assertTrue(result.isSuccess)
        assertEquals("app", result.getOrThrow().value)
    }

    @Test
    fun `should throw on create with invalid value`() {
        assertThrows<IllegalArgumentException> { DotSeparatedName.create("!!!") }
    }
}
