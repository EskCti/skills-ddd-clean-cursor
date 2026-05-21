# Flutter Entity Pattern (Dart puro + sealed Result)

## Result<T> base (lib/core/result/result.dart)

```dart
sealed class Result<T> {
  const Result();

  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Failure<T>;

  T? get dataOrNull => switch (this) {
    Success<T> s => s.data,
    Failure<T> _ => null,
  };

  R when<R>({
    required R Function(T data) success,
    required R Function(String message, Object? exception) failure,
  }) =>
      switch (this) {
        Success<T> s => success(s.data),
        Failure<T> f => failure(f.message, f.exception),
      };
}

final class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

final class Failure<T> extends Result<T> {
  final String message;
  final Object? exception;
  const Failure(this.message, {this.exception});
}
```

## Failure específico do BC (lib/features/customers/domain/failures/customer_failure.dart)

```dart
sealed class CustomerFailure {
  const CustomerFailure();
}

final class CustomerNotFound extends CustomerFailure {
  final String id;
  const CustomerNotFound(this.id);
}

final class CustomerDuplicateEmail extends CustomerFailure {
  final String email;
  const CustomerDuplicateEmail(this.email);
}

final class CustomerInvalidData extends CustomerFailure {
  final String field;
  final String reason;
  const CustomerInvalidData(this.field, this.reason);
}
```

## Entidade (lib/features/customers/domain/entities/customer.dart)

```dart
import 'package:equatable/equatable.dart';
import '../../../../core/result/result.dart';
import '../failures/customer_failure.dart';

class Customer extends Equatable {
  final String id;
  final String name;
  final String email;
  final String cpf;
  final bool isActive;

  const Customer._({
    required this.id,
    required this.name,
    required this.email,
    required this.cpf,
    required this.isActive,
  });

  static Result<Customer> create({
    required String id,
    required String name,
    required String email,
    required String cpf,
  }) {
    if (name.trim().length < 2) {
      return Failure('Nome inválido',
          exception: CustomerInvalidData('name', 'Mínimo 2 caracteres'));
    }
    if (!email.contains('@') || !email.contains('.')) {
      return Failure('Email inválido',
          exception: CustomerInvalidData('email', 'Formato inválido'));
    }
    if (cpf.replaceAll(RegExp(r'\D'), '').length != 11) {
      return Failure('CPF inválido',
          exception: CustomerInvalidData('cpf', 'Deve ter 11 dígitos'));
    }
    return Success(Customer._(
      id: id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      cpf: cpf.replaceAll(RegExp(r'\D'), ''),
      isActive: true,
    ));
  }

  Customer copyWith({bool? isActive}) => Customer._(
    id: id, name: name, email: email, cpf: cpf,
    isActive: isActive ?? this.isActive,
  );

  @override
  List<Object?> get props => [id, name, email, cpf, isActive];
}
```

## Checklist

- [ ] `Result<T>` sealed class criada em `lib/core/result/result.dart`
- [ ] `<Bc>Failure` sealed class com variantes específicas
- [ ] Entidade com construtor privado (`._`) e factory `create()`
- [ ] Validações retornam `Failure` — nunca `throw`
- [ ] `Equatable` para igualdade por valor
- [ ] Sem dependências Flutter ou Riverpod na entidade
