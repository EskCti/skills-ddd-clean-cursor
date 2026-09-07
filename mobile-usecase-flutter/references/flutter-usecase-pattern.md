# Flutter UseCase Pattern

## Base UseCase (lib/core/usecases/usecase.dart)

```dart
import '../result/result.dart';

abstract class UseCase<Type, Params> {
  Future<Result<Type>> call(Params params);
}

class NoParams {
  const NoParams();
}
```

## Params (lib/features/customers/application/usecases/create_customer_use_case.dart)

```dart
import '../../../../core/result/result.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/customer.dart';
import '../failures/customer_failure.dart';
import '../repositories/i_customer_repository.dart';

class CreateCustomerParams {
  final String name;
  final String email;
  final String cpf;
  const CreateCustomerParams({required this.name, required this.email, required this.cpf});
}

class CreateCustomerUseCase implements UseCase<Customer, CreateCustomerParams> {
  final ICustomerRepository _repository;
  const CreateCustomerUseCase(this._repository);

  @override
  Future<Result<Customer>> call(CreateCustomerParams params) async {
    // 1. Criar entidade (validação de domínio)
    final entityResult = Customer.create(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: params.name,
      email: params.email,
      cpf: params.cpf,
    );

    if (entityResult.isFailure) return entityResult;
    final customer = (entityResult as Success<Customer>).data;

    // 2. Verificar regra de negócio: email único
    final existsResult = await _repository.findByEmail(params.email);
    if (existsResult.isSuccess && (existsResult as Success).data != null) {
      return Failure(
        'Email já cadastrado',
        exception: CustomerDuplicateEmail(params.email),
      );
    }

    // 3. Persistir
    return _repository.create(customer);
  }
}
```

## GetCustomersUseCase (sem parâmetros)

```dart
class GetCustomersUseCase implements UseCase<List<Customer>, NoParams> {
  final ICustomerRepository _repository;
  const GetCustomersUseCase(this._repository);

  @override
  Future<Result<List<Customer>>> call(NoParams params) =>
      _repository.findAll();
}
```

## Checklist

- [ ] `UseCase<Type, Params>` base criado em `lib/core/usecases/usecase.dart`
- [ ] `<Nome>Params` data class por use case
- [ ] Repository recebido no construtor (`final IRepository _repository`)
- [ ] `call()` retorna `Future<Result<Type>>` — nunca `throw`
- [ ] Validações de domínio delegadas à entidade
- [ ] Regras de negócio (e.g., email único) verificadas antes de persistir
