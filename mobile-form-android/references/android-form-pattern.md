# Android Form Pattern (Jetpack Compose + UseCase via ViewModel)

## Screen de Formulário (chama ViewModel que usa UseCase)

```kotlin
@Composable
fun CustomerFormScreen(
    viewModel: CustomerViewModel = hiltViewModel(),
    onSuccess: () -> Unit = {}
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var cpf by remember { mutableStateOf("") }
    var nameError by remember { mutableStateOf<String?>(null) }
    var emailError by remember { mutableStateOf<String?>(null) }
    var cpfError by remember { mutableStateOf<String?>(null) }

    val createState by viewModel.createState.collectAsStateWithLifecycle()

    LaunchedEffect(createState) {
        if (createState is CustomerViewModel.CreateState.Success) {
            viewModel.resetCreateState()
            onSuccess()
        }
    }

    fun validate(): Boolean {
        nameError = when {
            name.trim().length < 2 -> "Mínimo 2 caracteres"
            else -> null
        }
        emailError = when {
            !email.contains('@') -> "Email inválido"
            else -> null
        }
        cpfError = when {
            cpf.replace(Regex("\\D"), "").length != 11 -> "CPF: 11 dígitos"
            else -> null
        }
        return listOf(nameError, emailError, cpfError).all { it == null }
    }

    Scaffold(topBar = { TopAppBar(title = { Text("Novo Cliente") }) }) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(16.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it; nameError = null },
                label = { Text("Nome *") },
                isError = nameError != null,
                supportingText = nameError?.let { { Text(it) } },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = email,
                onValueChange = { email = it; emailError = null },
                label = { Text("Email *") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                isError = emailError != null,
                supportingText = emailError?.let { { Text(it) } },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = cpf,
                onValueChange = { if (it.length <= 11) { cpf = it; cpfError = null } },
                label = { Text("CPF *") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                isError = cpfError != null,
                supportingText = cpfError?.let { { Text(it) } },
                modifier = Modifier.fillMaxWidth()
            )

            if (createState is CustomerViewModel.CreateState.Error) {
                Text(
                    (createState as CustomerViewModel.CreateState.Error).message,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                )
            }

            Button(
                onClick = {
                    if (validate()) viewModel.createCustomer(name.trim(), email.trim(), cpf.trim())
                },
                enabled = createState !is CustomerViewModel.CreateState.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (createState is CustomerViewModel.CreateState.Loading)
                    CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onPrimary)
                else
                    Text("Salvar")
            }
        }
    }
}
```

## Checklist

- [ ] Formulário chama `viewModel.createCustomer(...)` — não o UseCase diretamente
- [ ] ViewModel expõe `createState: StateFlow<CreateState>` (Idle/Loading/Success/Error)
- [ ] `LaunchedEffect(createState)` para navegar no Success + `resetCreateState()`
- [ ] Erros do UseCase (e.g., email duplicado) aparecem via `CreateState.Error.message`
- [ ] Validações de UI no formulário (formato) + validações de negócio no UseCase
