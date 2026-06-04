# Flutter Form Pattern (UseCase + Result)

## Formulário que chama UseCase (não Repository)

```dart
// features/customers/presentation/pages/customer_form_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/result/result.dart';
import '../../domain/usecases/create_customer_use_case.dart';
import '../providers/customers_notifier.dart';

class CustomerFormPage extends ConsumerStatefulWidget {
  final String? customerId;
  const CustomerFormPage({super.key, this.customerId});

  @override
  ConsumerState<CustomerFormPage> createState() => _CustomerFormPageState();
}

class _CustomerFormPageState extends ConsumerState<CustomerFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _cpfCtrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _cpfCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      // Chama o notifier que internamente usa o CreateCustomerUseCase
      final result = await ref.read(customersNotifierProvider.notifier).create(
        CreateCustomerParams(
          name: _nameCtrl.text.trim(),
          email: _emailCtrl.text.trim(),
          cpf: _cpfCtrl.text.trim(),
        ),
      );

      if (!mounted) return;

      result.when(
        success: (_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Cliente criado com sucesso!'), backgroundColor: Colors.green),
          );
          context.pop();
        },
        failure: (messages, exception) {
          for (final msg in messages) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(msg), backgroundColor: Colors.red),
            );
          }
        },
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Novo Cliente')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(labelText: 'Nome *', border: OutlineInputBorder()),
                validator: (v) => (v == null || v.trim().length < 2) ? 'Mínimo 2 caracteres' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _emailCtrl,
                decoration: const InputDecoration(labelText: 'Email *', border: OutlineInputBorder()),
                keyboardType: TextInputType.emailAddress,
                validator: (v) => (v == null || !v.contains('@')) ? 'Email inválido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _cpfCtrl,
                decoration: const InputDecoration(labelText: 'CPF *', border: OutlineInputBorder()),
                keyboardType: TextInputType.number,
                maxLength: 11,
                validator: (v) => (v == null || v.replaceAll(RegExp(r'\D'), '').length != 11) ? 'CPF inválido' : null,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Salvar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

## Checklist

- [ ] Formulário chama `notifier.create(UseCase Params)` — não o repository
- [ ] `result.when(success:, failure:)` para tratar resposta
- [ ] Validações de UI no `validator` do TextFormField (validação rápida de formato)
- [ ] Validações de domínio no UseCase/Entity (regras de negócio)
- [ ] `ScaffoldMessenger` com cores distintas para sucesso (green) e erro (red)
