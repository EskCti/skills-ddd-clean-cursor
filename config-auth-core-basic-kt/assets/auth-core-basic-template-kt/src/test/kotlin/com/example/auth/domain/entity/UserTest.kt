package com.example.auth.domain.entity

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class UserTest {

    @Test
    fun `should create user with valid data`() {
        val result = User.tryCreate(name = "John Doe", email = "john@example.com")
        assertTrue(result.isSuccess)
        assertNotNull(result.value?.id)
    }

    @Test
    fun `should create user with admin flag`() {
        val user = User.create(name = "Admin", email = "admin@example.com", admin = true)
        assertEquals(true, user.admin)
    }

    @Test
    fun `should create user with avatarUrl`() {
        val user = User.create(name = "Test", email = "test@example.com", avatarUrl = "https://img.example.com/1.png")
        assertEquals("https://img.example.com/1.png", user.avatarUrl)
    }

    @Test
    fun `should default admin to false`() {
        val user = User.create(name = "Test", email = "test@example.com")
        assertEquals(false, user.admin)
    }

    @Test
    fun `should fail with blank name`() {
        val result = User.tryCreate(name = "", email = "test@example.com")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail with invalid email`() {
        val result = User.tryCreate(name = "Test", email = "invalid")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should accumulate validation errors from all value objects`() {
        val result = User.tryCreate(name = "", email = "invalid")
        assertTrue(result.isFailure)
        assertEquals(2, result.errors.size)
    }

    @Test
    fun `should compare users by id`() {
        val uuid = "550e8400-e29b-41d4-a716-446655440000"
        val u1 = User.create(id = uuid, name = "A", email = "a@example.com")
        val u2 = User.create(id = uuid, name = "B", email = "b@example.com")
        assertEquals(u1, u2)
    }
}