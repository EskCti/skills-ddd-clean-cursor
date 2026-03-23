package com.example.modules.auth

import com.example.auth.user.query.FindUserByIdQuery
import kotlinx.coroutines.runBlocking
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException

@Aspect
@Component
class RequireAdminAspect(
    private val findUserById: FindUserByIdQuery
) {

    @Around("@annotation(RequireAdmin)")
    fun checkAdmin(joinPoint: ProceedingJoinPoint): Any? {
        val userId = SecurityContextHolder.getContext().authentication?.name
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "NOT_AUTHENTICATED")

        val user = runBlocking { findUserById.findById(userId) }
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "USER_NOT_FOUND")

        if (!user.admin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "ADMIN_REQUIRED")
        }

        return joinPoint.proceed()
    }
}
