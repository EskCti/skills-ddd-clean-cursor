package com.example.modules.auth.adapter

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "passwords")
data class PasswordJpaEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    val userId: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    val hash: String = "",

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now()
)
