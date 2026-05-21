# Flutter Screen Pattern (Riverpod + UseCase + go_router)

## Provider + AsyncNotifier (chama UseCase, não Repository diretamente)

```dart
// features/customers/presentation/providers/customers_notifier.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/customer.dart';
import '../../domain/usecases/create_customer_use_case.dart';
import '../../domain/usecases/get_customers_use_case.dart';
import '../../data/providers/customer_providers.dart';
import '../../../../core/result/result.dart';

// Estado de UI com semântica clara
sealed class CustomersState {
  const CustomersState();
}
final class CustomersLoading extends CustomersState { const CustomersLoading(); }
final class CustomersLoaded extends CustomersState {
  final List<Customer> customers;
  const CustomersLoaded(this.customers);
}
final class CustomersError extends CustomersState {
  final String message;
  const CustomersError(this.message);
}

final customersNotifierProvider =
    AsyncNotifierProvider<CustomersNotifier, CustomersState>(CustomersNotifier.new);

class CustomersNotifier extends AsyncNotifier<CustomersState> {
  late final GetCustomersUseCase _getCustomers;
  late final CreateCustomerUseCase _createCustomer;

  @override
  Future<CustomersState> build() async {
    _getCustomers = ref.read(getCustomersUseCaseProvider);
    _createCustomer = ref.read(createCustomerUseCaseProvider);
    return _load();
  }

  Future<CustomersState> _load() async {
    final result = await _getCustomers(const NoParams());
    return result.when(
      success: (customers) => CustomersLoaded(customers),
      failure: (msg, _) => CustomersError(msg),
    );
  }

  Future<void> refresh() async {
    state = const AsyncData(CustomersLoading());
    state = AsyncData(await _load());
  }

  Future<Result<Customer>> create(CreateCustomerParams params) async {
    final result = await _createCustomer(params);
    if (result.isSuccess) ref.invalidateSelf();
    return result;
  }
}
```

## Tela de Listagem (ConsumerWidget)

```dart
// features/customers/presentation/pages/customer_list_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/customers_notifier.dart';

class CustomerListPage extends ConsumerWidget {
  const CustomerListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stateAsync = ref.watch(customersNotifierProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Clientes')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/customers/new'),
        child: const Icon(Icons.add),
      ),
      body: stateAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (state) => switch (state) {
          CustomersLoading() => const Center(child: CircularProgressIndicator()),
          CustomersError(:final message) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(message, style: const TextStyle(color: Colors.red)),
                ElevatedButton(
                  onPressed: () => ref.read(customersNotifierProvider.notifier).refresh(),
                  child: const Text('Tentar novamente'),
                ),
              ],
            ),
          ),
          CustomersLoaded(:final customers) => RefreshIndicator(
            onRefresh: () => ref.read(customersNotifierProvider.notifier).refresh(),
            child: customers.isEmpty
              ? const Center(child: Text('Nenhum cliente cadastrado'))
              : ListView.builder(
                  itemCount: customers.length,
                  itemBuilder: (context, index) {
                    final c = customers[index];
                    return ListTile(
                      leading: CircleAvatar(child: Text(c.name[0].toUpperCase())),
                      title: Text(c.name),
                      subtitle: Text(c.email),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.push('/customers/${c.id}'),
                    );
                  },
                ),
          ),
        },
      ),
    );
  }
}
```

## Arquitetura de Camadas (Flutter Clean Architecture)

```
Presentation (Riverpod Notifier / Widget)
      ↓ chama
Application (UseCase<Type, Params>)
      ↓ chama
Domain (IRepository interface)
      ↓ implementado por
Data (RepositoryImpl → RemoteDataSource → Dio)
```

## Checklist

- [ ] Notifier injeta UseCase (não Repository diretamente)
- [ ] UseCase recebido via provider Riverpod
- [ ] `Result.when(success:, failure:)` para tratar retorno
- [ ] `sealed class CustomersState` para estados de UI ricos
- [ ] `refresh()` chama UseCase novamente
- [ ] Tela consome o state via pattern matching (`switch`)
