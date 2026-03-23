package com.example.auth.oauth.entity

import org.junit.jupiter.api.Test
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class OAuthAccountTest {

    private val validUserId = "550e8400-e29b-41d4-a716-446655440000"

    @Test
    fun `should create oauth account with valid data`() {
        val result = OAuthAccount.tryCreate(
            userId = validUserId,
            provider = "google",
            providerAccountId = "google-123"
        )
        assertTrue(result.isSuccess)
        assertNotNull(result.getOrNull()?.id)
    }

    @Test
    fun `should fail with blank provider`() {
        val result = OAuthAccount.tryCreate(
            userId = validUserId,
            provider = "",
            providerAccountId = "google-123"
        )
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail with blank provider account id`() {
        val result = OAuthAccount.tryCreate(
            userId = validUserId,
            provider = "google",
            providerAccountId = ""
        )
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail with invalid user id`() {
        val result = OAuthAccount.tryCreate(
            userId = "invalid",
            provider = "google",
            providerAccountId = "google-123"
        )
        assertTrue(result.isFailure)
    }
}
