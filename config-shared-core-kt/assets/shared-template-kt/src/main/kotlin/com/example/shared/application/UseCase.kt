package com.example.shared.application

interface UseCase<IN, OUT> {
    suspend fun execute(data: IN): Result<OUT>
}
