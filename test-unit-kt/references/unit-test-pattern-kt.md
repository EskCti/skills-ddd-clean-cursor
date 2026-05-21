# Unit Test Pattern (Kotlin)

## Meta de cobertura

| Escopo | Mínimo |
|--------|--------|
| `*.domain.*` + `*.application.*` | **95% lines** (JaCoCo) |
| Infrastructure | ≥80% recomendado |

## Paths

```
packages/<module>/src/test/kotlin/<pkg>/
├── domain/entity/<Name>Test.kt
├── domain/vo/<Name>Test.kt
└── application/usecase/<Name>UseCaseTest.kt
```

## O que testar

- **VO / value class**: criação válida, inválida, igualdade
- **Entity**: `create()` / companion, invariantes, métodos de domínio
- **UseCase**: `suspend invoke()` com repository mock (MockK ou manual fake)
- **Result**: `isSuccess` / `isFailure` e mensagens de erro

## build.gradle.kts (JaCoCo gate)

```kotlin
plugins {
    kotlin("jvm")
    jacoco
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.2")
    testImplementation("io.mockk:mockk:1.13.12")
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

tasks.jacocoTestCoverageVerification {
    dependsOn(tasks.jacocoTestReport)
    violationRules {
        rule {
            element = "BUNDLE"
            limit {
                counter = "LINE"
                minimum = "0.95".toBigDecimal()
            }
        }
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestCoverageVerification)
}
```

Filtrar apenas domain+application no report (opcional, root build):

```kotlin
tasks.jacocoTestReport {
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                include("**/domain/**", "**/application/**")
            }
        })
    )
}
```

## Exemplo UseCaseTest

```kotlin
class CreateCustomerUseCaseTest {
    private val repository = mockk<CustomerRepository>()
    private val useCase = CreateCustomerUseCase(repository)

    @Test
    fun `should create customer when cpf is unique`() = runBlocking {
        coEvery { repository.findByCpf(any()) } returns Result.success(null)
        coEvery { repository.create(any()) } returns Result.success(customer)

        val result = useCase(CreateCustomerInput("João", "a@b.com", "12345678901"))

        assertTrue(result.isSuccess)
        coVerify { repository.create(any()) }
    }
}
```

## Checklist

- [ ] JUnit 5 + kotlin-test
- [ ] JaCoCo configurado com mínimo 95%
- [ ] `./gradlew check` passa com coverage verification
- [ ] CI (`config-cicd-kt`) executa build + jacoco
