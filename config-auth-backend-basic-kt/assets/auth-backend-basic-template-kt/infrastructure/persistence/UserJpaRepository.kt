package com.example.modules.auth.infrastructure.persistence

import com.example.modules.auth.infrastructure.persistence.entity.UserJpaEntity
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserJpaRepository : JpaRepository<UserJpaEntity, UUID> {
    fun findByEmail(email: String): UserJpaEntity?
    fun existsByEmail(email: String): Boolean
}
