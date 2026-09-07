# Flutter Repository Pattern (interface + Dio + Result)

## Interface (domain) — lib/features/customers/domain/repositories/i_customer_repository.dart

```dart
import '../../../../core/result/result.dart';
import '../entities/customer.dart';

abstract class ICustomerRepository {
  Future<Result<List<Customer>>> findAll();
  Future<Result<Customer>> findById(String id);
  Future<Result<Customer?>> findByEmail(String email);
  Future<Result<Customer>> create(Customer customer);
  Future<Result<void>> update(Customer customer);
  Future<Result<void>> delete(String id);
}
```

## Model (data) — lib/features/customers/data/models/customer_model.dart

```dart
import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/customer.dart';
import '../../../../core/result/result.dart';

part 'customer_model.g.dart';

@JsonSerializable()
class CustomerModel {
  final String id;
  final String name;
  final String email;
  final String cpf;
  @JsonKey(name: 'is_active')
  final bool isActive;

  const CustomerModel({
    required this.id,
    required this.name,
    required this.email,
    required this.cpf,
    required this.isActive,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) =>
      _$CustomerModelFromJson(json);

  Map<String, dynamic> toJson() => _$CustomerModelToJson(this);

  Result<Customer> toDomain() => Customer.create(
    id: id, name: name, email: email, cpf: cpf,
  );

  factory CustomerModel.fromDomain(Customer customer) => CustomerModel(
    id: customer.id, name: customer.name,
    email: customer.email, cpf: customer.cpf,
    isActive: customer.isActive,
  );
}
```

## RemoteDataSource — lib/features/customers/data/datasources/customer_remote_datasource.dart

```dart
import 'package:dio/dio.dart';
import '../models/customer_model.dart';

abstract class ICustomerRemoteDataSource {
  Future<List<CustomerModel>> findAll();
  Future<CustomerModel> findById(String id);
  Future<CustomerModel> create(CustomerModel model);
  Future<CustomerModel> update(String id, CustomerModel model);
  Future<void> delete(String id);
}

class CustomerRemoteDataSourceImpl implements ICustomerRemoteDataSource {
  final Dio _dio;
  static const String _path = '/customers';

  const CustomerRemoteDataSourceImpl(this._dio);

  @override
  Future<List<CustomerModel>> findAll() async {
    final response = await _dio.get(_path);
    return (response.data as List)
        .map((e) => CustomerModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<CustomerModel> findById(String id) async {
    final response = await _dio.get('$_path/$id');
    return CustomerModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<CustomerModel> create(CustomerModel model) async {
    final response = await _dio.post(_path, data: model.toJson());
    return CustomerModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<CustomerModel> update(String id, CustomerModel model) async {
    final response = await _dio.put('$_path/$id', data: model.toJson());
    return CustomerModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<void> delete(String id) async {
    await _dio.delete('$_path/$id');
  }
}
```

## RepositoryImpl — lib/features/customers/data/repositories/customer_repository_impl.dart

```dart
import 'package:dio/dio.dart';
import '../../../../core/result/result.dart';
import '../../domain/entities/customer.dart';
import '../../domain/repositories/i_customer_repository.dart';
import '../datasources/customer_remote_datasource.dart';
import '../models/customer_model.dart';

class CustomerRepositoryImpl implements ICustomerRepository {
  final ICustomerRemoteDataSource _dataSource;
  const CustomerRepositoryImpl(this._dataSource);

  @override
  Future<Result<List<Customer>>> findAll() async {
    try {
      final models = await _dataSource.findAll();
      final entities = <Customer>[];
      for (final model in models) {
        final result = model.toDomain();
        if (result.isFailure) continue; // skip invalid data from API
        entities.add((result as Success<Customer>).data);
      }
      return Success(entities);
    } on DioException catch (e) {
      return Failure(_errorMessages(e, fallback: 'Erro ao buscar clientes'), exception: e);
    }
  }

  @override
  Future<Result<Customer>> findById(String id) async {
    try {
      final model = await _dataSource.findById(id);
      return model.toDomain();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return const Failure(['Cliente não encontrado']);
      }
      return Failure(_errorMessages(e, fallback: 'Erro ao buscar cliente'), exception: e);
    }
  }

  @override
  Future<Result<Customer>> create(Customer customer) async {
    try {
      final model = await _dataSource.create(CustomerModel.fromDomain(customer));
      return model.toDomain();
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        return const Failure(['Email já cadastrado']);
      }
      return Failure(_errorMessages(e, fallback: 'Erro ao criar cliente'), exception: e);
    }
  }

  @override
  Future<Result<Customer?>> findByEmail(String email) async {
    try {
      final response = await _dataSource.findAll();
      final found = response.where((m) => m.email == email).firstOrNull;
      if (found == null) return const Success(null);
      return found.toDomain().when(
        success: (c) => Success(c),
        failure: (msg, ex) => Failure(msg, exception: ex),
      );
    } on DioException catch (e) {
      return Failure(_errorMessages(e, fallback: 'Erro de rede'), exception: e);
    }
  }

  @override
  Future<Result<void>> update(Customer customer) async {
    try {
      await _dataSource.update(customer.id, CustomerModel.fromDomain(customer));
      return const Success(null);
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        return const Failure(['Email já cadastrado']);
      }
      return Failure(_errorMessages(e, fallback: 'Erro ao atualizar'), exception: e);
    }
  }

  @override
  Future<Result<void>> delete(String id) async {
    try {
      await _dataSource.delete(id);
      return const Success(null);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return const Failure(['Cliente não encontrado']);
      }
      return Failure(_errorMessages(e, fallback: 'Erro ao deletar'), exception: e);
    }
  }

  List<String> _errorMessages(DioException e, {required String fallback}) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final errors = data['errors'];
      if (errors is List) {
        final messages = errors.whereType<String>().toList();
        if (messages.isNotEmpty) return messages;
      }
    }
    return [fallback];
  }
}
```

## Provider Riverpod (lib/features/customers/data/providers/customer_providers.dart)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../domain/repositories/i_customer_repository.dart';
import '../../application/usecases/create_customer_use_case.dart';
import '../../application/usecases/get_customers_use_case.dart';
import '../datasources/customer_remote_datasource.dart';
import '../repositories/customer_repository_impl.dart';

final customerRepositoryProvider = Provider<ICustomerRepository>((ref) {
  final dio = ref.watch(dioProvider);
  final dataSource = CustomerRemoteDataSourceImpl(dio);
  return CustomerRepositoryImpl(dataSource);
});

final createCustomerUseCaseProvider = Provider<CreateCustomerUseCase>((ref) {
  return CreateCustomerUseCase(ref.read(customerRepositoryProvider));
});

final getCustomersUseCaseProvider = Provider<GetCustomersUseCase>((ref) {
  return GetCustomersUseCase(ref.read(customerRepositoryProvider));
});
```

## Checklist

- [ ] `ICustomerRepository` em domain/ (Dart puro, sem Dio)
- [ ] `CustomerModel` com `fromJson/toJson` e `toDomain()/fromDomain()`
- [ ] `ICustomerRemoteDataSource` + `Impl` com Dio (inclui `update` via `put` e `delete` via HTTP DELETE — sem stubs)
- [ ] `CustomerRepositoryImpl` captura `DioException` → `Failure(messages)` parseando `{ errors: [...] }` do body
- [ ] Providers Riverpod injetam datasource → repo → use case
- [ ] `build_runner` executado para gerar `.g.dart`
