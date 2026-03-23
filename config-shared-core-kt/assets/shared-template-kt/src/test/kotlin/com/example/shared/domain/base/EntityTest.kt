package com.example.shared.domain.base

import com.example.shared.domain.vo.Id
import org.junit.jupiter.api.Test
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlin.test.assertFalse

class TestEntity(
    id: Id,
    val number: Int,
    createdAt: Instant = Instant.now(),
    updatedAt: Instant = Instant.now(),
    deletedAt: Instant? = null
) : Entity<TestEntity>(id, createdAt, updatedAt, deletedAt) {
    companion object {
        fun create(number: Int, id: String? = null): TestEntity {
            val resolvedId = Id.create(id)
            return TestEntity(id = resolvedId, number = number)
        }
    }
}

class EntityTest {

    @Test
    fun `should create entity with generated id`() {
        val entity = TestEntity.create(42)
        assertNotNull(entity.id.value)
    }

    @Test
    fun `should create entity with provided id`() {
        val uuid = "550e8400-e29b-41d4-a716-446655440000"
        val entity = TestEntity.create(42, uuid)
        assertEquals(uuid, entity.id.value)
    }

    @Test
    fun `should initialize default timestamps`() {
        val entity = TestEntity.create(42)
        assertNotNull(entity.createdAt)
        assertNotNull(entity.updatedAt)
        assertNull(entity.deletedAt)
    }

    @Test
    fun `should keep provided timestamps and deletedAt`() {
        val createdAt = Instant.parse("2024-01-01T10:00:00Z")
        val updatedAt = Instant.parse("2024-01-02T11:00:00Z")
        val deletedAt = Instant.parse("2024-01-03T12:00:00Z")

        val entity = TestEntity(
            id = Id.create(),
            number = 42,
            createdAt = createdAt,
            updatedAt = updatedAt,
            deletedAt = deletedAt
        )

        assertEquals(createdAt, entity.createdAt)
        assertEquals(updatedAt, entity.updatedAt)
        assertEquals(deletedAt, entity.deletedAt)
    }

    @Test
    fun `should consider entities equal when they have the same id`() {
        val uuid = "550e8400-e29b-41d4-a716-446655440000"
        val entity1 = TestEntity.create(42, uuid)
        val entity2 = TestEntity.create(999, uuid)
        assertTrue(entity1.equals(entity2))
    }

    @Test
    fun `should consider entities different when they have different ids`() {
        val entity1 = TestEntity.create(42)
        val entity2 = TestEntity.create(42)
        assertFalse(entity1.equals(entity2))
    }

    @Test
    fun `should have consistent hashCode for same id`() {
        val uuid = "550e8400-e29b-41d4-a716-446655440000"
        val entity1 = TestEntity.create(1, uuid)
        val entity2 = TestEntity.create(2, uuid)
        assertEquals(entity1.hashCode(), entity2.hashCode())
    }

    @Test
    fun `should produce readable toString`() {
        val entity = TestEntity.create(42)
        assertTrue(entity.toString().startsWith("TestEntity(id="))
    }
}
