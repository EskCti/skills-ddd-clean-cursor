package com.example.modules.auth.adapter

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PasswordJpaRepository : JpaRepository<PasswordJpaEntity, UUID> {
    fun findByUserId(userId: UUID): PasswordJpaEntity?
    fun findTop5ByUserIdOrderByCreatedAtDesc(userId: UUID): List<PasswordJpaEntity>
}
