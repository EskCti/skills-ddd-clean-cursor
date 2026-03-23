package com.example.shared.domain.repository

interface CrudRepository<T> :
    CreateRepository<T>,
    FindByIdRepository<T>,
    UpdateRepository<T>,
    DeleteRepository
