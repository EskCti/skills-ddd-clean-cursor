# Flutter Project Pattern

## api_config.dart

```dart
// lib/core/config/api_config.dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  static String get baseUrl => dotenv.env['API_URL'] ?? 'http://localhost:4000';
}
```

## DioClient com interceptor de auth

```dart
// lib/core/network/dio_client.dart
import 'package:dio/dio.dart';
import '../config/api_config.dart';

class DioClient {
  static Dio create({String? token}) {
    final dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    if (token != null) {
      dio.interceptors.add(InterceptorsWrapper(
        onRequest: (options, handler) {
          options.headers['Authorization'] = 'Bearer $token';
          handler.next(options);
        },
        onError: (error, handler) {
          // tratar 401 → logout
          handler.next(error);
        },
      ));
    }

    return dio;
  }
}
```

## main.dart com Riverpod e go_router

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'core/router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'My App',
      theme: ThemeData(colorSchemeSeed: Colors.blue, useMaterial3: true),
      routerConfig: router,
    );
  }
}
```

## app_router.dart (go_router)

```dart
// lib/core/router/app_router.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/customers/presentation/pages/customer_list_page.dart';
import '../../features/customers/presentation/pages/customer_form_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/customers',
    routes: [
      GoRoute(
        path: '/customers',
        builder: (context, state) => const CustomerListPage(),
      ),
      GoRoute(
        path: '/customers/new',
        builder: (context, state) => const CustomerFormPage(),
      ),
      GoRoute(
        path: '/customers/:id/edit',
        builder: (context, state) => CustomerFormPage(customerId: state.pathParameters['id']),
      ),
    ],
  );
});
```

## Checklist

- [ ] Estrutura de pastas core/ + features/ criada
- [ ] pubspec.yaml com dependências (riverpod, dio, go_router, freezed, flutter_dotenv)
- [ ] DioClient configurado com baseUrl e interceptors
- [ ] go_router com rotas por feature
- [ ] .env com API_URL
- [ ] flutter pub get executado
- [ ] build_runner executado para code generation (freezed, json_serializable)
