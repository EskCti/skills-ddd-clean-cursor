package com.example.shared.infrastructure

interface TransactionManager {
    suspend fun <T> runInTransaction(block: suspend () -> T): T
}
