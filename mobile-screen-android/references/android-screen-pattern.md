# Android Screen Pattern (Jetpack Compose + ViewModel + UseCase + Hilt)

## ViewModel que injeta UseCase (não Repository diretamente)

```kotlin
// features/customers/presentation/CustomerViewModel.kt
@HiltViewModel
class CustomerViewModel @Inject constructor(
    private val getCustomers: GetCustomersUseCase,
    private val createCustomer: CreateCustomerUseCase,
) : ViewModel() {

    sealed class UiState {
        data object Loading : UiState()
        data class Success(val customers: List<Customer>) : UiState()
        data class Error(val message: String) : UiState()
    }

    sealed class CreateState {
        data object Idle : CreateState()
        data object Loading : CreateState()
        data object Success : CreateState()
        data class Error(val message: String) : CreateState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _createState = MutableStateFlow<CreateState>(CreateState.Idle)
    val createState: StateFlow<CreateState> = _createState.asStateFlow()

    init { loadCustomers() }

    fun loadCustomers() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            getCustomers(NoParams)
                .onSuccess { _uiState.value = UiState.Success(it) }
                .onFailure { _uiState.value = UiState.Error(it.message ?: "Erro desconhecido") }
        }
    }

    fun createCustomer(name: String, email: String, cpf: String) {
        viewModelScope.launch {
            _createState.value = CreateState.Loading
            createCustomer(CreateCustomerParams(name = name, email = email, cpf = cpf))
                .onSuccess {
                    _createState.value = CreateState.Success
                    loadCustomers() // atualiza a lista
                }
                .onFailure { _createState.value = CreateState.Error(it.message ?: "Erro") }
        }
    }

    fun resetCreateState() { _createState.value = CreateState.Idle }
}
```

## Screen de Listagem (Compose)

```kotlin
@Composable
fun CustomerListScreen(
    viewModel: CustomerViewModel = hiltViewModel(),
    onNavigateToNew: () -> Unit = {},
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = { TopAppBar(title = { Text("Clientes") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToNew) {
                Icon(Icons.Default.Add, contentDescription = "Novo")
            }
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            when (val s = state) {
                is CustomerViewModel.UiState.Loading ->
                    CircularProgressIndicator(Modifier.align(Alignment.Center))

                is CustomerViewModel.UiState.Error ->
                    Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(s.message, color = MaterialTheme.colorScheme.error)
                        Spacer(Modifier.height(8.dp))
                        Button(onClick = { viewModel.loadCustomers() }) { Text("Tentar novamente") }
                    }

                is CustomerViewModel.UiState.Success ->
                    LazyColumn {
                        items(s.customers, key = { it.id }) { c ->
                            ListItem(
                                headlineContent = { Text(c.name) },
                                supportingContent = { Text(c.email) },
                            )
                            HorizontalDivider()
                        }
                    }
            }
        }
    }
}
```

## Arquitetura de Camadas (Android Clean Architecture)

```
Presentation (ViewModel + Composable Screen)
      ↓ @Inject UseCase
Application (UseCase<Params, R>)
      ↓ @Inject IRepository
Domain (IRepository interface — Kotlin puro)
      ↓ @Binds impl
Data (RepositoryImpl → Retrofit ApiService → DTO)
```

## Checklist

- [ ] ViewModel injeta UseCase (não IRepository diretamente)
- [ ] UseCase injetado via `@HiltViewModel @Inject constructor`
- [ ] ViewModel expõe dois StateFlows: `uiState` e `createState`
- [ ] `onSuccess / onFailure` de `kotlin.Result` para tratar retorno
- [ ] `loadCustomers()` pode ser chamado para refresh
