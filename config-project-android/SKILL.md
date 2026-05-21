---
name: config-project-android
stack: kotlin
description: Inicializar ou continuar um projeto Android Kotlin com Jetpack Compose, Hilt para injeção de dependências, Retrofit para HTTP e ViewModel + StateFlow para gerenciamento de estado. Usar quando o pedido envolver bootstrap de projeto Android, setup Kotlin + Compose + Hilt + Retrofit, ou padronização de estrutura de app Android nativo.
---

# Config Project (Android)

## Overview

Configurar projeto Android Kotlin com Jetpack Compose (UI declarativa), Hilt (DI), Retrofit (HTTP) e ViewModel com StateFlow.

## Estrutura alvo

```
app/
└── src/main/kotlin/com/exemplo/myapp/
    ├── core/
    │   ├── network/         # RetrofitClient, ApiService
    │   └── di/              # NetworkModule, RepositoryModule
    ├── features/
    │   └── customers/
    │       ├── data/
    │       │   ├── remote/      # CustomerApiService, CustomerDto
    │       │   └── repository/  # CustomerRepositoryImpl
    │       ├── domain/
    │       │   ├── model/       # Customer data class
    │       │   └── repository/  # ICustomerRepository interface
    │       └── presentation/
    │           ├── CustomerViewModel.kt
    │           └── screens/
    │               ├── CustomerListScreen.kt
    │               └── CustomerFormScreen.kt
    └── navigation/
        └── AppNavGraph.kt
```

## Dependências (build.gradle.kts — app)

```kotlin
// Compose BOM
implementation(platform("androidx.compose:compose-bom:2024.05.00"))
implementation("androidx.compose.ui:ui")
implementation("androidx.compose.material3:material3")
implementation("androidx.compose.ui:ui-tooling-preview")
implementation("androidx.activity:activity-compose:1.9.0")
implementation("androidx.navigation:navigation-compose:2.7.7")
implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

// Hilt
implementation("com.google.dagger:hilt-android:2.51")
ksp("com.google.dagger:hilt-compiler:2.51")
implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

// Retrofit + Gson
implementation("com.squareup.retrofit2:retrofit:2.11.0")
implementation("com.squareup.retrofit2:converter-gson:2.11.0")
implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
```

## Workflow

1. Criar projeto Android no Android Studio (Empty Activity, Kotlin, Compose, min SDK 26).
2. Adicionar dependências no `build.gradle.kts`.
3. Configurar Hilt: anotar `Application` com `@HiltAndroidApp`, `MainActivity` com `@AndroidEntryPoint`.
4. Criar `NetworkModule` com Retrofit apontando para a URL base do backend.
5. Criar `AppNavGraph` com Navigation Compose.
6. Criar feature de exemplo (customers) como referência.

## References

- Consultar references/android-project-pattern.md para código base.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
