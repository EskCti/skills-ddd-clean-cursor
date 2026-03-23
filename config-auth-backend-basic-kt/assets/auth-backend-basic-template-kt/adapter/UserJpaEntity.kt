package com.example.modules.auth.adapter

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "users")
open class UserJpaEntity(
    @Id
    @Column(columnDefinition = "uuid")
    open var id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    open var name: String = "",

    @Column(nullable = false, unique = true)
    open var email: String = "",

    @Column(nullable = false)
    open var admin: Boolean = false,

    @Column(name = "avatar_url")
    open var avatarUrl: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    open var createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    open var updatedAt: Instant = Instant.now()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is UserJpaEntity) return false
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()
}
