# Workflow de Integração Contínua com OpenSpec

**Propósito**: Documentar o workflow completo de CI/CD integrado com OpenSpec para o projeto RetailOps (C# + Vue + Android).

---

## 🏗️ **Visão Geral da Arquitetura CI/CD**

### **Componentes do Pipeline**
```
┌─────────────────────────────────────────────────────────┐
│              CI/CD Pipeline com OpenSpec                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   GitHub    │    │   GitHub    │    │   GitHub    │ │
│  │   Actions   │───▶│   Actions   │───▶│   Actions   │ │
│  │    (CI)     │    │   (CD Web)  │    │  (CD Mobile)│ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                     │                │        │
│         ▼                     ▼                ▼        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Test &    │    │    Azure    │    │   Google    │ │
│  │   Build     │    │   App Svc   │    │   Play      │ │
│  │   Reports   │    │   (Web)     │    │  Console    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │            OpenSpec Integration                   │ │
│  │  • Validate dependencies                          │ │
│  │  • Update progress dashboard                      │ │
│  │  • Archive completed changes                      │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Fluxo de Trabalho Completo**
```
1. Desenvolvedor cria/atualiza código
   ↓
2. Push para branch (feature/EP-XXX)
   ↓
3. GitHub Actions CI é acionado
   ↓
4. Executa testes e validações
   ↓
5. Se CI passar → Pull Request
   ↓
6. Code Review e aprovação
   ↓
7. Merge para main
   ↓
8. GitHub Actions CD é acionado
   ↓
9. Deploy para produção
   ↓
10. Atualiza dashboard OpenSpec
```

---

## 🔧 **Configuração do CI (Continuous Integration)**

### **Arquivo: `.github/workflows/ci-csharp-vue-android.yml`**
```yaml
name: CI - C# + Vue + Android

on:
  push:
    branches: [ main, develop, feature/*, ep-* ]
  pull_request:
    branches: [ main ]

env:
  DOTNET_VERSION: '8.0.x'
  NODE_VERSION: '20.x'

jobs:
  # Job 1: Testes C# Backend
  test-csharp:
    name: Test C# Backend
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
        
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}
        
    - name: Restore dependencies
      run: dotnet restore
      
    - name: Build solution
      run: dotnet build --no-restore --configuration Release
      
    - name: Run unit tests
      run: |
        dotnet test \
          --no-restore \
          --verbosity normal \
          --configuration Release \
          --collect:"XPlat Code Coverage" \
          --results-directory ./coverage
          
    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: test-results-csharp
        path: ./**/TestResults/*.trx
        
    - name: Upload coverage reports
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: coverage-reports-csharp
        path: ./coverage
        
    - name: Check coverage threshold
      run: |
        # Script para verificar cobertura ≥95%
        ./scripts/check-coverage.sh --threshold 95 --language csharp
        
  # Job 2: Build Vue Frontend
  build-vue:
    name: Build Vue Frontend
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      working-directory: ./apps/web-vue
      
    - name: Build Vue app
      run: npm run build
      working-directory: ./apps/web-vue
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: vue-build
        path: ./apps/web-vue/dist
        
  # Job 3: Build Android Mobile
  build-android:
    name: Build Android App
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup JDK
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Build Android app
      run: |
        cd apps/mobile-android
        ./gradlew assembleRelease
        
    - name: Upload APK
      uses: actions/upload-artifact@v4
      with:
        name: android-apk
        path: ./apps/mobile-android/app/build/outputs/apk/release/*.apk
        
  # Job 4: Validação OpenSpec
  validate-openspec:
    name: Validate OpenSpec
    runs-on: ubuntu-latest
    needs: [test-csharp, build-vue, build-android]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Validate OpenSpec dependencies
      run: |
        # Verificar se há mudanças OpenSpec ativas
        if [ -d "openspec/changes" ]; then
          for change in openspec/changes/*/; do
            if [ -d "$change" ] && [ -f "$change/tasks.md" ]; then
              change_id=$(basename $change)
              echo "🔍 Validando dependências de $change_id"
              
              # Usar o skill openspec-validate-dependencies
              dotnet run --project tools/OpenSpecValidator -- validate-dependencies $change_id
              
              if [ $? -ne 0 ]; then
                echo "❌ Falha na validação de dependências para $change_id"
                exit 1
              fi
            fi
          done
        fi
        
    - name: Update progress dashboard
      run: |
        # Atualizar dashboard com status atual
        ./scripts/update-openspec-dashboard.sh
        
  # Job 5: Security Scanning
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run SAST (Static Application Security Testing)
      uses: github/codeql-action/init@v3
      with:
        languages: 'csharp, javascript'
        
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      
    - name: Dependency vulnerability scan
      run: |
        # Scan C# dependencies
        dotnet list package --vulnerable
        
        # Scan npm dependencies
        cd apps/web-vue
        npm audit --audit-level=high
```

---

## 🚀 **Configuração do CD (Continuous Deployment)**

### **Arquivo: `.github/workflows/cd-web-vue.yml`**
```yaml
name: CD - Vue Web App

on:
  push:
    branches: [ main ]
    
env:
  AZURE_WEBAPP_NAME: 'retailops-web'
  AZURE_RESOURCE_GROUP: 'retailops-rg'
  
jobs:
  deploy-web:
    name: Deploy Vue Web App
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        
    - name: Install dependencies
      run: npm ci
      working-directory: ./apps/web-vue
      
    - name: Build Vue app
      run: npm run build
      working-directory: ./apps/web-vue
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        VITE_APP_NAME: 'RetailOps'
        
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: 'upload'
        app_location: './apps/web-vue'
        output_location: 'dist'
        
    - name: Update OpenSpec dashboard
      run: |
        # Marcar deploy como concluído no dashboard
        ./scripts/update-deploy-status.sh --app web --status success
        
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        fields: repo,message,commit,author,action,eventName,ref,workflow,job,took
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### **Arquivo: `.github/workflows/cd-android.yml`**
```yaml
name: CD - Android App

on:
  push:
    branches: [ main ]
    
env:
  GOOGLE_PLAY_TRACK: 'internal'  # internal, alpha, beta, production
  
jobs:
  deploy-android:
    name: Deploy Android App
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup JDK
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        
    - name: Build Android app
      run: |
        cd apps/mobile-android
        ./gradlew assembleRelease
        
    - name: Sign APK
      run: |
        # Assinar APK com keystore
        ./scripts/sign-android-apk.sh
        
    - name: Upload to Google Play Console
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
        packageName: 'com.retailops.app'
        releaseFiles: './apps/mobile-android/app/build/outputs/apk/release/*.apk'
        track: ${{ env.GOOGLE_PLAY_TRACK }}
        
    - name: Update OpenSpec dashboard
      run: |
        # Marcar deploy como concluído no dashboard
        ./scripts/update-deploy-status.sh --app android --status success
        
    - name: Notify Slack
      uses: 8398a7/action-slack@v1
      with:
        status: ${{ job.status }}
        fields: repo,message,commit,author,action,eventName,ref,workflow,job,took
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🔄 **Integração OpenSpec no CI/CD**

### **Validação Automática de Dependências**
```yaml
# .github/workflows/validate-openspec.yml
name: Validate OpenSpec Dependencies

on:
  pull_request:
    paths:
      - 'openspec/changes/**'
      
jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Validate dependencies
      run: |
        # Usar o skill openspec-validate-dependencies
        for task_file in openspec/changes/*/tasks.md; do
          if [ -f "$task_file" ]; then
            change_id=$(dirname $task_file | xargs basename)
            echo "🔍 Validando $change_id"
            
            dotnet run --project tools/OpenSpecValidator -- validate-dependencies $change_id
            
            if [ $? -ne 0 ]; then
              echo "❌ Falha na validação de $change_id"
              exit 1
            fi
          fi
        done
```

### **Atualização Automática do Dashboard**
```yaml
# .github/workflows/update-dashboard.yml
name: Update OpenSpec Dashboard

on:
  workflow_run:
    workflows: [ "CI - C# + Vue + Android", "CD - Vue Web App", "CD - Android App" ]
    types:
      - completed
      
jobs:
  update:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Update dashboard
      run: |
        # Obter status do workflow
        WORKFLOW_STATUS="${{ github.event.workflow_run.conclusion }}"
        WORKFLOW_NAME="${{ github.event.workflow_run.name }}"
        
        # Atualizar dashboard com status
        ./scripts/update-openspec-dashboard.sh \
          --workflow "$WORKFLOW_NAME" \
          --status "$WORKFLOW_STATUS"
```

### **Arquivamento Automático de Mudanças**
```yaml
# .github/workflows/archive-openspec.yml
name: Archive OpenSpec Changes

on:
  push:
    branches: [ main ]
    paths:
      - 'openspec/changes/**/tasks.md'
      
jobs:
  archive:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Archive completed changes
      run: |
        # Verificar se todas as tasks estão completas
        for task_file in openspec/changes/*/tasks.md; do
          if [ -f "$task_file" ]; then
            change_id=$(dirname $task_file | xargs basename)
            
            # Verificar se todas as tasks estão marcadas como [x]
            incomplete_tasks=$(grep -c "\[ \]" "$task_file" || true)
            
            if [ "$incomplete_tasks" -eq 0 ]; then
              echo "📦 Arquivando $change_id"
              
              # Mover para pasta de arquivamento
              mv "openspec/changes/$change_id" "openspec/changes/archive/$(date +%Y-%m-%d)-$change_id"
              
              # Atualizar dashboard
              ./scripts/update-openspec-dashboard.sh --change "$change_id" --status archived
            fi
          fi
        done
```

---

## 🛠️ **Scripts de Suporte**

### **Script: `scripts/check-coverage.sh`**
```bash
#!/bin/bash
# Script para verificar cobertura de testes

set -e

# Parâmetros
THRESHOLD=95
LANGUAGE="csharp"
REPORT_PATH="./coverage"

while [[ $# -gt 0 ]]; do
  case $1 in
    --threshold)
      THRESHOLD="$2"
      shift 2
      ;;
    --language)
      LANGUAGE="$2"
      shift 2
      ;;
    --report-path)
      REPORT_PATH="$2"
      shift 2
      ;;
    *)
      echo "Parâmetro desconhecido: $1"
      exit 1
      ;;
  esac
done

echo "🔍 Verificando cobertura de testes..."
echo "Linguagem: $LANGUAGE"
echo "Threshold: $THRESHOLD%"
echo "Caminho do relatório: $REPORT_PATH"

# Lógica específica por linguagem
case $LANGUAGE in
  csharp)
    # Para C# com Coverlet
    COVERAGE_FILE=$(find $REPORT_PATH -name "coverage.cobertura.xml" | head -1)
    
    if [ -z "$COVERAGE_FILE" ]; then
      echo "❌ Arquivo de cobertura não encontrado"
      exit 1
    fi
    
    # Extrair cobertura de linha
    LINE_COVERAGE=$(grep -o 'line-rate="[0-9.]*"' "$COVERAGE_FILE" | grep -o '[0-9.]*')
    COVERAGE_PERCENT=$(echo "$LINE_COVERAGE * 100" | bc | awk '{printf "%.2f", $0}')
    
    echo "📊 Cobertura atual: $COVERAGE_PERCENT%"
    
    if (( $(echo "$COVERAGE_PERCENT < $THRESHOLD" | bc -l) )); then
      echo "❌ Cobertura abaixo do threshold ($THRESHOLD%)"
      exit 1
    else
      echo "✅ Cobertura acima do threshold ($THRESHOLD%)"
    fi
    ;;
    
  typescript)
    # Para TypeScript com Jest
    COVERAGE_FILE="./coverage/coverage-summary.json"
    
    if [ ! -f "$COVERAGE_FILE" ]; then
      echo "❌ Arquivo de cobertura não encontrado"
      exit 1
    fi
    
    # Extrair cobertura de linha
    LINE_COVERAGE=$(jq -r '.total.lines.pct' "$COVERAGE_FILE")
    
    echo "📊 Cobertura atual: $LINE_COVERAGE%"
    
    if (( $(echo "$LINE_COVERAGE < $THRESHOLD" | bc -l) )); then
      echo "❌ Cobertura abaixo do threshold ($THRESHOLD%)"
      exit 1
    else
      echo "✅ Cobertura acima do threshold ($THRESHOLD%)"
    fi
    ;;
    
  *)
    echo "❌ Linguagem não suportada: $LANGUAGE"
    exit 1
    ;;
esac

echo "✅ Verificação de cobertura concluída com sucesso"
```

### **Script: `scripts/update-openspec-dashboard.sh`**
```bash
#!/bin/bash
# Script para atualizar o dashboard OpenSpec

set -e

# Parâmetros
CHANGE_ID=""
STATUS=""
WORKFLOW=""
APP=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --change)
      CHANGE_ID="$2"
      shift 2
      ;;
    --status)
      STATUS="$2"
      shift 2
      ;;
    --workflow)
      WORKFLOW="$2"
      shift 2
      ;;
    --app)
      APP="$2"
      shift 2
      ;;
    *)
      echo "Parâmetro desconhecido: $1"
      exit 1
      ;;
  esac
done

echo "📊 Atualizando dashboard OpenSpec..."

# Diretório do dashboard
DASHBOARD_DIR=".agents/skills/docs/dashboard"
DASHBOARD_FILE="$DASHBOARD_DIR/openspec-progress-dashboard.md"

if [ ! -f "$DASHBOARD_FILE" ]; then
  echo "❌ Arquivo do dashboard não encontrado: $DASHBOARD_FILE"
  exit 1
fi

# Lógica de atualização baseada nos parâmetros
if [ -n "$CHANGE_ID" ] && [ -n "$STATUS" ]; then
  echo "🔄 Atualizando status da mudança: $CHANGE_ID -> $STATUS"
  
  # Atualizar status no dashboard
  sed -i "s/## $CHANGE_ID.*/## $CHANGE_ID ($STATUS)/" "$DASHBOARD_FILE"
  
  # Atualizar progresso
  case $STATUS in
    completed)
      sed -i "s/\[ \] $CHANGE_ID/\[x\] $CHANGE_ID/" "$DASHBOARD_FILE"
      ;;
    in_progress)
      sed -i "s/\[ \] $CHANGE_ID/\[🔄\] $CHANGE_ID/" "$DASHBOARD_FILE"
      ;;
    archived)
      sed -i "s/\[x\] $CHANGE_ID/\[📦\] $CHANGE_ID/" "$DASHBOARD_FILE"
      ;;
  esac
fi

if [ -n "$WORKFLOW" ] && [ -n "$STATUS" ]; then
  echo "🔄 Atualizando status do workflow: $WORKFLOW -> $STATUS"
  
  # Adicionar entrada de log
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  LOG_ENTRY="| $TIMESTAMP | $WORKFLOW | $STATUS |"
  
  # Adicionar ao dashboard
  echo "$LOG_ENTRY" >> "$DASHBOARD_FILE"
fi

if [ -n "$APP" ] && [ -n "$STATUS" ]; then
  echo "🔄 Atualizando status do app: $APP -> $STATUS"
  
  # Atualizar status do deploy
  sed -i "s/| $APP.*| $STATUS |/" "$DASHBOARD_FILE"
fi

echo "✅ Dashboard atualizado com sucesso"
```

### **Script: `scripts/validate-openspec-dependencies.sh`**
```bash
#!/bin/bash
# Script para validar dependências OpenSpec

set -e

# Parâmetros
CHANGE_ID=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --change)
      CHANGE_ID="$2"
      shift 2
      ;;
    *)
      echo "Parâmetro desconhecido: $1"
      exit 1
      ;;
  esac
done

echo "🔍 Validando dependências OpenSpec..."

if [ -z "$CHANGE_ID" ]; then
  echo "❌ ID da mudança não especificado"
  exit 1
fi

# Caminho do arquivo de tasks
TASKS_FILE="openspec/changes/$CHANGE_ID/tasks.md"

if [ ! -f "$TASKS_FILE" ]; then
  echo "❌ Arquivo de tasks não encontrado: $TASKS_FILE"
  exit 1
fi

echo "📋 Analisando tasks de: $CHANGE_ID"

# Extrair tasks e dependências
TASKS=$(grep -E "^- \[ \] \`([a-z]+:[a-z]+(:[a-z]+)?)\`" "$TASKS_FILE" | sed 's/^- \[ \] //')

# Mapeamento de dependências válidas
declare -A VALID_DEPENDENCIES=(
  ["domain:vo"]=""
  ["domain:entity"]="domain:vo"
  ["domain:service"]="domain:entity,domain:vo"
  ["app:dto"]="domain:entity,domain:vo"
  ["app:usecase"]="app:dto,domain:entity,domain:service"
  ["app:query"]="app:dto"
  ["infra:repository"]="domain:entity"
  ["infra:persistence"]="infra:repository,domain:entity"
  ["interface:controller"]="app:usecase,infra:persistence"
  ["interface:entity"]=""
  ["interface:usecase"]="interface:entity"
  ["interface:repository"]="interface:usecase"
  ["interface:page"]="interface:repository"
  ["interface:mobile-entity"]=""
  ["interface:mobile-usecase"]="interface:mobile-entity"
  ["interface:mobile-repository"]="interface:mobile-usecase"
  ["interface:mobile"]="interface:mobile-repository"
)

# Verificar ordem inside-out
PREVIOUS_LAYER=""
ERRORS=0

while IFS= read -r TASK; do
  # Extrair prefixo da task
  PREFIX=$(echo "$TASK" | grep -o '\`[a-z]+:[a-z]+(:[a-z]+)?\`' | tr -d '`')
  
  if [ -z "$PREFIX" ]; then
    continue
  fi
  
  echo "  📝 Task: $PREFIX"
  
  # Verificar se prefixo é válido
  if [[ ! "${!VALID_DEPENDENCIES[@]}" =~ "$PREFIX" ]]; then
    echo "    ❌ Prefixo inválido: $PREFIX"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  
  # Verificar ordem
  if [ -n "$PREVIOUS_LAYER" ]; then
    CURRENT_INDEX=$(echo "${!VALID_DEPENDENCIES[@]}" | tr ' ' '\n' | grep -n "$PREFIX" | cut -d: -f1)
    PREVIOUS_INDEX=$(echo "${!VALID_DEPENDENCIES[@]}" | tr ' ' '\n' | grep -n "$PREVIOUS_LAYER" | cut -d: -f1)
    
    if [ "$CURRENT_INDEX" -lt "$PREVIOUS_INDEX" ]; then
      echo "    ❌ Ordem incorreta: $PREFIX vem depois de $PREVIOUS_LAYER"
      ERRORS=$((ERRORS + 1))
    fi
  fi
  
  PREVIOUS_LAYER="$PREFIX"
  
done <<< "$TASKS"

# Verificar dependências
echo "🔗 Verificando dependências..."

while IFS= read -r TASK; do
  # Extrair prefixo e dependências
  PREFIX=$(echo "$TASK" | grep -o '\`[a-z]+:[a-z]+(:[a-z]+)?\`' | tr -d '`')
  DEPENDENCIES=$(echo "$TASK" | grep -o 'dependencies: \[.*\]' | sed 's/dependencies: \[//' | sed 's/\]//' | tr ',' '\n' | tr -d ' ' | tr -d "'" | tr -d '"')
  
  if [ -n "$DEPENDENCIES" ]; then
    echo "  📝 Task: $PREFIX"
    echo "    Dependências: $DEPENDENCIES"
    
    # Verificar cada dependência
    while IFS= read -r DEP; do
      if [[ ! "${VALID_DEPENDENCIES[$PREFIX]}" =~ "$DEP" ]]; then
        echo "    ❌ Dependência inválida: $DEP para $PREFIX"
        ERRORS=$((ERRORS + 1))
      fi
    done <<< "$DEPENDENCIES"
  fi
  
done <<< "$TASKS"

# Resultado
if [ $ERRORS -eq 0 ]; then
  echo "✅ Todas as dependências são válidas"
  exit 0
else
  echo "❌ Encontradas $ERRORS dependências inválidas"
  exit 1
fi
```

---

## 📊 **Monitoramento e Alertas**

### **Configuração de Alertas no GitHub Actions**
```yaml
# .github/workflows/notify-failures.yml
name: Notify CI/CD Failures

on:
  workflow_run:
    workflows: [ "CI - C# + Vue + Android", "CD - Vue Web App", "CD - Android App" ]
    types:
      - completed
      
jobs:
  notify:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    
    steps:
    - name: Send Slack notification
      uses: slackapi/slack-github-action@v1.24.0
      with:
        payload: |
          {
            "text": "❌ CI/CD Failure",
            "blocks": [
              {
                "type": "header",
                "text": {
                  "type": "plain_text",
                  "text": "❌ CI/CD Pipeline Failed"
                }
              },
              {
                "type": "section",
                "fields": [
                  {
                    "type": "mrkdwn",
                    "text": "*Workflow:*\n${{ github.event.workflow_run.name }}"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*Status:*\nFailed"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*Branch:*\n${{ github.event.workflow_run.head_branch }}"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*Commit:*\n${{ github.event.workflow_run.head_sha }}"
                  }
                ]
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "<${{ github.event.workflow_run.html_url }}|View Workflow Run>"
                }
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
    - name: Send email notification
      uses: dawidd6/action-send-mail@v3
      with:
        server_address: smtp.gmail.com
        server_port: 465
        username: ${{ secrets.EMAIL_USERNAME }}
        password: ${{ secrets.EMAIL_PASSWORD }}
        subject: "❌ CI/CD Failure: ${{ github.event.workflow_run.name }}"
        to: dev-team@retailops.com
        from: CI/CD Bot <ci-cd@retailops.com>
        body: |
          CI/CD Pipeline Failure Notification
          
          Workflow: ${{ github.event.workflow_run.name }}
          Status: Failed
          Branch: ${{ github.event.workflow_run.head_branch }}
          Commit: ${{ github.event.workflow_run.head_sha }}
          
          View details: ${{ github.event.workflow_run.html_url }}
```

### **Dashboard de Métricas CI/CD**
```yaml
# .github/workflows/update-metrics.yml
name: Update CI/CD Metrics

on:
  schedule:
    - cron: '0 0 * * *'  # Diariamente à meia-noite
    
jobs:
  update-metrics:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Collect CI/CD metrics
      run: |
        # Coletar métricas dos últimos 30 dias
        ./scripts/collect-ci-cd-metrics.sh --days 30
        
    - name: Update metrics dashboard
      run: |
        # Atualizar dashboard de métricas
        ./scripts/update-metrics-dashboard.sh
```

---

## 🔧 **Configuração de Ambiente**

### **Secrets do GitHub**
```yaml
# .github/workflows/secrets-example.yml
# NÃO COMITAR ESTE ARQUIVO - Apenas para referência

secrets:
  # Backend C#
  AZURE_CLIENT_ID: "xxx"
  AZURE_CLIENT_SECRET: "xxx"
  AZURE_TENANT_ID: "xxx"
  
  # Frontend Vue
  VITE_API_URL: "https://api.retailops.com"
  VITE_APP_NAME: "RetailOps"
  
  # Mobile Android
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: "xxx"
  ANDROID_KEYSTORE_BASE64: "xxx"
  ANDROID_KEYSTORE_PASSWORD: "xxx"
  ANDROID_KEY_ALIAS: "xxx"
  ANDROID_KEY_PASSWORD: "xxx"
  
  # Notificações
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/xxx"
  EMAIL_USERNAME: "ci-cd@retailops.com"
  EMAIL_PASSWORD: "xxx"
  
  # Banco de dados
  DATABASE_CONNECTION_STRING: "Server=xxx;Database=xxx;User Id=xxx;Password=xxx;"
  
  # Outros
  OPENAI_API_KEY: "sk-xxx"
  SENTRY_DSN: "https://xxx@sentry.io/xxx"
```

### **Variáveis de Ambiente**
```yaml
# .github/workflows/env-example.yml
# Variáveis de ambiente compartilhadas

env:
  # Configurações gerais
  NODE_ENV: 'production'
  ASPNETCORE_ENVIRONMENT: 'Production'
  
  # Backend C#
  DOTNET_CLI_TELEMETRY_OPTOUT: 1
  DOTNET_NOLOGO: 1
  
  # Frontend Vue
  VITE_BUILD_TIMESTAMP: ${{ github.run_number }}
  VITE_COMMIT_SHA: ${{ github.sha }}
  
  # Mobile Android
  ANDROID_COMPILE_SDK: 34
  ANDROID_BUILD_TOOLS: "34.0.0"
  ANDROID_MIN_SDK: 24
  ANDROID_TARGET_SDK: 34
```

---

## 📈 **Métricas e KPIs**

### **Métricas de CI**
| Métrica | Alvo | Descrição |
|---------|------|-----------|
| **Build Success Rate** | ≥99% | Taxa de sucesso de builds |
| **Test Pass Rate** | ≥98% | Taxa de sucesso de testes |
| **Test Coverage** | ≥95% | Cobertura de código por testes |
| **Build Time** | ≤10min | Tempo médio de build |
| **Test Execution Time** | ≤5min | Tempo médio de execução de testes |

### **Métricas de CD**
| Métrica | Alvo | Descrição |
|---------|------|-----------|
| **Deployment Success Rate** | ≥99% | Taxa de sucesso de deploys |
| **Deployment Frequency** | ≥1/day | Frequência de deploys para produção |
| **Lead Time for Changes** | ≤1h | Tempo do commit ao deploy |
| **Mean Time to Recovery (MTTR)** | ≤30min | Tempo médio para recuperação de falhas |
| **Change Failure Rate** | ≤5% | Taxa de falhas em deploys |

### **Métricas de Qualidade**
| Métrica | Alvo | Descrição |
|---------|------|-----------|
| **Code Quality Score** | ≥90% | Pontuação de qualidade de código |
| **Security Vulnerabilities** | 0 | Vulnerabilidades de segurança críticas |
| **Technical Debt Ratio** | ≤5% | Razão de dívida técnica |
| **Bug Rate** | ≤0.1% | Taxa de bugs por linha de código |

---

## 🚀 **Próximos Passos**

### **Fase 1: Implementação Básica** ✅
- [x] Configurar CI para C# + Vue + Android
- [x] Configurar CD para Web e Mobile
- [x] Integrar validação OpenSpec no CI

### **Fase 2: Otimização** 🟡
- [ ] Implementar cache de build
- [ ] Adicionar testes de performance
- [ ] Configurar canary deployments

### **Fase 3: Avançado** ⏳
- [ ] Implementar feature flags
- [ ] Configurar blue-green deployments
- [ ] Adicionar chaos engineering

---

## 🛠️ **Troubleshooting e Boas Práticas**

### **Problemas Comuns e Soluções**

#### **1. Builds Lentos**
**Sintoma**: Tempo de build > 15 minutos
**Solução**:
```yaml
# Adicionar cache de dependências
- name: Cache .NET packages
  uses: actions/cache@v3
  with:
    path: ~/.nuget/packages
    key: ${{ runner.os }}-nuget-${{ hashFiles('**/packages.lock.json') }}
    restore-keys: |
      ${{ runner.os }}-nuget-
      
- name: Cache npm packages
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

#### **2. Falhas de Dependência OpenSpec**
**Sintoma**: Validação de dependências falha
**Solução**:
```bash
# Verificar manualmente as dependências
./scripts/validate-openspec-dependencies.sh --change EP-001

# Corrigir ordem inside-out
# 1. domain:vo → 2. domain:entity → 3. app:dto → 4. app:usecase → 5. interface:controller
```

#### **3. Deployments Interrompidos**
**Sintoma**: CD falha no meio do processo
**Solução**:
```yaml
# Adicionar retry com backoff
- name: Deploy with retry
  uses: nick-fields/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: |
      # Comando de deploy
      az webapp deploy ...
```

### **Boas Práticas para Tasks OpenSpec**

#### **1. Nomenclatura Consistente**
```markdown
# ✅ CORRETO
- [ ] `domain:vo` PasswordVO com hash bcrypt (~1h)
- [ ] `app:usecase` CreateUserUseCase com validação (~2h)

# ❌ INCORRETO  
- [ ] Criar PasswordVO
- [ ] Use case para criar usuário
```

#### **2. Dependências Explícitas**
```markdown
# ✅ CORRETO
- [ ] `interface:controller` UsersController (~2h)
  - **Dependencies:** `app:usecase`, `infra:persistence`

# ❌ INCORRETO
- [ ] `interface:controller` UsersController (~2h)
```

#### **3. Estimates Realistas**
```markdown
# ✅ CORRETO
- [ ] `domain:entity` UserEntity com regras de negócio (~3h)

# ❌ INCORRETO
- [ ] `domain:entity` UserEntity (~30min)  # Subestimado!
```

### **Monitoramento Proativo**

#### **1. Alertas de Degradação**
```yaml
# Monitorar aumento no tempo de build
- name: Alert on build time increase
  if: ${{ job.status == 'success' && steps.build-time.outputs.duration > 600 }}
  run: |
    ./scripts/send-alert.sh \
      --type "build_degradation" \
      --message "Build time increased to ${{ steps.build-time.outputs.duration }}s"
```

#### **2. Health Checks Automáticos**
```yaml
# Health check pós-deploy
- name: Post-deploy health check
  run: |
    # Verificar se API está respondendo
    curl --retry 5 --retry-delay 10 \
      https://api.retailops.com/health
      
    # Verificar métricas de performance
    ./scripts/check-performance-metrics.sh
```

### **Integração com Skills**

#### **1. Cache de Contexto entre Skills**
```typescript
// Exemplo: Reutilizar EmailVO entre skills
export class CreateUserSkill {
  async execute(params: CreateUserParams): Promise<Result<User>> {
    const context = ContextFactory.getManager(params.changeId);
    
    // Verificar se EmailVO já foi calculado
    let emailVo = context.get(CACHE_KEYS.DOMAIN_VO.EMAIL);
    
    if (!emailVo) {
      // Calcular e armazenar no cache
      const emailResult = EmailVO.create(params.email);
      if (emailResult.isFailure()) {
        return Result.fail(emailResult.error);
      }
      
      emailVo = emailResult.value;
      context.set(CACHE_KEYS.DOMAIN_VO.EMAIL, emailVo);
    }
    
    // Usar EmailVO do cache
    return this.userRepository.create({
      email: emailVo,
      // ... outros campos
    });
  }
}
```

#### **2. Validação Automática com Skills**
```yaml
# Workflow que usa skills para validação
- name: Validate with openspec-validate-dependencies
  run: |
    # Usar skill diretamente
    npx @namespace/openspec-validate-dependencies \
      --change EP-001 \
      --strict
    
    # Validar cobertura com skill
    npx @namespace/test-coverage-validator \
      --threshold 95 \
      --language csharp
```

---

## 📚 **Recursos Adicionais**

### **Documentação Oficial**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [.NET CI/CD Best Practices](https://docs.microsoft.com/en-us/dotnet/core/docker/ci-cd)
- [Vue.js Deployment Guide](https://vuejs.org/guide/scaling-up/deployment.html)
- [Android CI/CD with GitHub Actions](https://developer.android.com/studio/test/ci-cd)

### **Templates e Exemplos**
- [OpenSpec Task Templates](../../templates/openspec-task-template.yaml)
- [Stack C# + Vue + Android Example](../../templates/openspec-stack-cs-vue-android-example.md)
- [Context Cache Usage Example](../../examples/context-cache-usage-example.md)

### **Ferramentas Recomendadas**
- **CI/CD**: GitHub Actions, Azure DevOps, CircleCI
- **Testes**: xUnit, Jest, Espresso
- **Monitoramento**: Sentry, Application Insights, Firebase Crashlytics
- **Segurança**: Snyk, Dependabot, CodeQL

---

## 🎯 **Conclusão**

Este workflow de CI/CD integrado com OpenSpec fornece uma base sólida para desenvolvimento contínuo no projeto RetailOps. A integração entre:

1. **CI Automático**: Validação de código, testes e cobertura
2. **CD Robusto**: Deploy automatizado para Web e Mobile
3. **OpenSpec Integration**: Validação de dependências e progress tracking
4. **Skills Optimization**: Cache de contexto e reutilização entre skills

Garante qualidade, velocidade e confiabilidade no processo de desenvolvimento. A implementação faseada permite começar com o essencial e evoluir gradualmente para práticas mais avançadas.

**Próximos passos imediatos**:
1. Implementar o workflow básico de CI
2. Configurar validação OpenSpec no pipeline
3. Testar deploy em ambiente de staging
4. Monitorar métricas e ajustar thresholds

Para dúvidas ou problemas, consulte a [documentação de troubleshooting](../troubleshooting/openspec-ci-cd-troubleshooting.md) ou abra uma issue no repositório.