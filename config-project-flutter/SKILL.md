---
name: config-project-flutter
stack: agnostic
description: Inicializar ou continuar um projeto Flutter (Dart) que consome um backend REST (NestJS, Spring Boot ou ASP.NET Core), com estrutura clean por feature, Riverpod para gerenciamento de estado, Dio para HTTP e go_router para navegação. Usar quando o pedido envolver bootstrap de projeto Flutter, setup Flutter + backend REST, ou padronização de estrutura de app mobile Flutter.
---

# Config Project (Flutter)

## Overview

Configurar projeto Flutter com arquitetura limpa por feature, consumindo um backend REST (qualquer stack deste repositório).

## Estrutura alvo

```
my_app/
├── lib/
│   ├── core/
│   │   ├── config/         # environment, api_config.dart
│   │   ├── network/        # dio_client.dart, interceptors
│   │   └── errors/         # failure.dart, exceptions.dart
│   ├── features/
│   │   └── customers/
│   │       ├── data/
│   │       │   ├── models/       # CustomerModel (json serializable)
│   │       │   └── repositories/ # CustomerRepositoryImpl
│   │       ├── domain/
│   │       │   ├── entities/     # Customer entity
│   │       │   └── repositories/ # ICustomerRepository (interface)
│   │       └── presentation/
│   │           ├── bloc/         # CustomerNotifier (Riverpod)
│   │           ├── pages/        # CustomerListPage, CustomerFormPage
│   │           └── widgets/      # reutilizáveis da feature
│   └── main.dart
├── pubspec.yaml
└── .env
```

## Dependências principais (pubspec.yaml)

```yaml
dependencies:
  flutter_riverpod: ^2.5.0
  dio: ^5.4.0
  go_router: ^14.0.0
  flutter_dotenv: ^5.1.0
  freezed_annotation: ^2.4.0
  json_annotation: ^4.9.0

dev_dependencies:
  build_runner: ^2.4.0
  freezed: ^2.5.0
  json_serializable: ^6.8.0
```

## Workflow

1. Criar projeto: `flutter create my_app --org com.exemplo`.
2. Adicionar dependências no `pubspec.yaml`.
3. Criar estrutura de pastas conforme acima.
4. Configurar `api_config.dart` com base URL do backend.
5. Configurar `DioClient` com interceptors (auth token, error handling).
6. Configurar `go_router` com rotas por feature.
7. Configurar `.env` com API_URL.
8. Executar `flutter pub get`.

## References

- Consultar references/flutter-project-pattern.md para código base.
- Consultar ../skills-standards.md para convenções globais.

## Global Standards

- Consultar ../skills-standards.md para padrões globais de nomenclatura e convenções gerais entre skills.
