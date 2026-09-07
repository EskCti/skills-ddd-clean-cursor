package com.example.auth.domain.entity

import org.junit.jupiter.api.Test
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class RoleTest {

    @Test
    fun `should create role with valid data`() {
        val result = Role.tryCreate(name = "admin", description = "Administrator role")
        assertTrue(result.isSuccess)
        assertNotNull(result.value?.id)
    }

    @Test
    fun `should fail with blank name`() {
        val result = Role.tryCreate(name = "")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should create role without description`() {
        val role = Role.create(name = "viewer")
        assertTrue(role.description == null)
    }
}