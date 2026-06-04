package com.example.shared.application

interface UseCase<IN, OUT> {
    suspend fun execute(data: IN): com.example.shared.domain.result.DomainResult<OUT>
}
