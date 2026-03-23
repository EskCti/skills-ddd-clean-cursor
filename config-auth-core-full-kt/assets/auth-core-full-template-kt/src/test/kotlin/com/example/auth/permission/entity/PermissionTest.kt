package com.example.auth.permission.entity

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class PermissionTest {

    @Test
    fun `should create permission with dot separated name`() {
        val result = Permission.tryCreate(name = "auth.users.read")
        assertTrue(result.isSuccess)
        assertEquals("auth.users.read", result.getOrNull()?.name?.value)
    }

    @Test
    fun `should fail with invalid permission name`() {
        val result = Permission.tryCreate(name = "!!invalid!!")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should create permission with description`() {
        val perm = Permission.create(name = "auth.users.write", description = "Write users")
        assertNotNull(perm.description)
    }
}
