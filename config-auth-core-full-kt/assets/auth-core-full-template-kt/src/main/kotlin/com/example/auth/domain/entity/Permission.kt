package com.example.auth.domain.entity

import com.example.shared.domain.result.DomainResult
import com.example.shared.domain.vo.DotSeparatedName
import com.example.shared.domain.vo.Id

data class Permission private constructor(
    val id: Id,
    val name: DotSeparatedName,
    val description: String? = null
) {
    companion object {
        fun create(id: String? = null, name: String, description: String? = null): Permission =
            tryCreate(id, name, description).getOrThrow()

        fun tryCreate(id: String? = null, name: String, description: String? = null): DomainResult<Permission> {
            val idResult = Id.tryCreate(id)
            val nameResult = DotSeparatedName.tryCreate(name)

            val errors = listOf(idResult, nameResult).flatMap { it.errors }
            if (errors.isNotEmpty()) {
                return DomainResult.failure(errors)
            }

            return DomainResult.success(Permission(id = idResult.value!!, name = nameResult.value!!, description = description))
        }
    }

    override fun equals(other: Any?): Boolean = other is Permission && other.id == this.id
    override fun hashCode(): Int = id.hashCode()
}