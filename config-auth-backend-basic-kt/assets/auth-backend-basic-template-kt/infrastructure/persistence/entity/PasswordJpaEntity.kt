package com.example.modules.auth.infrastructure.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "passwords")
open class PasswordJpaEntity(
    @Id
    @Column(columnDefinition = "uuid")
    open var id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    open var userId: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    open var hash: String = "",

    @Column(name = "created_at", nullable = false, updatable = false)
    open var createdAt: Instant = Instant.now()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is PasswordJpaEntity) return false
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()
}
