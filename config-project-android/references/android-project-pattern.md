# Android Project Pattern (Kotlin + Jetpack Compose + Hilt)

## Application class com @HiltAndroidApp

```kotlin
// MyApp.kt
@HiltAndroidApp
class MyApp : Application()
```

## MainActivity com @AndroidEntryPoint

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyAppTheme {
                val navController = rememberNavController()
                AppNavGraph(navController = navController)
            }
        }
    }
}
```

## NetworkModule (Hilt)

```kotlin
// core/di/NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    @Provides
    @Singleton
    fun provideCustomerApiService(retrofit: Retrofit): CustomerApiService =
        retrofit.create(CustomerApiService::class.java)
}
```

## AppNavGraph (Navigation Compose)

```kotlin
// navigation/AppNavGraph.kt
@Composable
fun AppNavGraph(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "customers") {
        composable("customers") {
            val viewModel: CustomerViewModel = hiltViewModel()
            CustomerListScreen(
                viewModel = viewModel,
                onNavigateToNew = { navController.navigate("customers/new") },
                onNavigateToEdit = { id -> navController.navigate("customers/$id/edit") }
            )
        }
        composable("customers/new") {
            val viewModel: CustomerViewModel = hiltViewModel()
            CustomerFormScreen(
                viewModel = viewModel,
                onSuccess = { navController.popBackStack() }
            )
        }
        composable("customers/{id}/edit", arguments = listOf(navArgument("id") { type = NavType.StringType })) { entry ->
            val viewModel: CustomerViewModel = hiltViewModel()
            CustomerFormScreen(
                viewModel = viewModel,
                customerId = entry.arguments?.getString("id"),
                onSuccess = { navController.popBackStack() }
            )
        }
    }
}
```

## Checklist

- [ ] `@HiltAndroidApp` na classe Application e registrada no AndroidManifest
- [ ] `@AndroidEntryPoint` na MainActivity
- [ ] `NetworkModule` com Retrofit, OkHttp e URL base
- [ ] `API_BASE_URL` em `buildConfigField` no `build.gradle.kts`
- [ ] `AppNavGraph` com Navigation Compose + `hiltViewModel()`
- [ ] Tema Material3 configurado
- [ ] ViewModel por feature com `@HiltViewModel`
- [ ] StateFlow para UI state (sealed class Loading/Success/Error)
