# E2E Test Pattern (Kotlin)

## Escopo

Testes de **API E2E** com Spring Boot Test + `MockMvc` ou `TestRestTemplate` + banco real (Testcontainers ou Postgres do CI).

## Estrutura

```
apps/backend-kt/src/test/kotlin/com/example/
├── integration/
│   └── CustomerControllerE2ETest.kt
└── AbstractIntegrationTest.kt
```

## build.gradle.kts (backend)

```kotlin
dependencies {
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:postgresql:1.20.4")
}
```

## Exemplo — MockMvc

```kotlin
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CustomerControllerE2ETest @Autowired constructor(
    private val mockMvc: MockMvc,
    private val objectMapper: ObjectMapper,
) {
    @Test
    fun `POST customers then GET by id`() {
        val body = mapOf("name" to "João", "email" to "joao@example.com", "cpf" to "12345678901")

        val create = mockMvc.perform(
            post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body))
        ).andExpect(status().isCreated).andReturn()

        val id = JsonPath.read<String>(create.response.contentAsString, "$.id")

        mockMvc.perform(get("/api/customers/$id"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.email").value("joao@example.com"))
    }
}
```

## CI

`./gradlew test` com Postgres service (ver `config-cicd-kt`).

## Checklist

- [ ] Fluxo POST → GET coberto
- [ ] Erro 400/404 quando aplicável
- [ ] `@Transactional` ou cleanup entre testes
