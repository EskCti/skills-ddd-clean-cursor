package com.example.shared.domain.base

import com.example.shared.domain.vo.Id
import java.time.Instant

abstract class Entity<T : Entity<T>>(
    val id: Id,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now(),
    val deletedAt: Instant? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false
        other as Entity<*>
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()

    override fun toString(): String = "${this::class.simpleName}(id=${id.value})"
}
