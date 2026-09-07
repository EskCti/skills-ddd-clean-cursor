package com.example.auth.domain.entity

import com.example.shared.domain.result.DomainResult
import com.example.shared.domain.vo.Id
import com.example.shared.domain.vo.Name

data class Role private constructor(
    val id: Id,
    val name: Name,
    val description: String? = null
) {
    companion object {
        fun create(id: String? = null, name: String, description: String? = null): Role =
            tryCreate(id, name, description).getOrThrow()

        fun tryCreate(id: String? = null, name: String, description: String? = null): DomainResult<Role> {
            val idResult = Id.tryCreate(id)
            val nameResult = Name.tryCreate(name)

            val errors = listOf(idResult, nameResult).flatMap { it.errors }
            if (errors.isNotEmpty()) {
                return DomainResult.failure(errors)
            }

            return DomainResult.success(Role(id = idResult.value!!, name = nameResult.value!!, description = description))
        }
    }

    override fun equals(other: Any?): Boolean = other is Role && other.id == this.id
    override fun hashCode(): Int = id.hashCode()
}