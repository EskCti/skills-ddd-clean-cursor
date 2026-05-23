#!/bin/bash

# Script de Correção Automática de Dependências para OpenSpec
# Versão: 1.0.0
# Propósito: Corrigir automaticamente problemas comuns em tasks OpenSpec

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
CHANGE_ID=""
DRY_RUN=false
BACKUP=true
VERBOSE=false

# Funções de utilidade
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Função para exibir ajuda
show_help() {
    echo "Uso: $0 [OPÇÕES]"
    echo ""
    echo "Corrige automaticamente problemas comuns em tasks OpenSpec"
    echo ""
    echo "Opções:"
    echo "  -c, --change ID        ID da change OpenSpec (ex: EP-001)"
    echo "  -d, --dry-run          Executar em modo de simulação (não altera arquivos)"
    echo "  --no-backup            Não criar backup dos arquivos originais"
    echo "  -v, --verbose          Modo verboso"
    echo "  -h, --help             Exibir esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 -c EP-001           Corrigir change EP-001"
    echo "  $0 -c EP-001 -d        Simular correções sem alterar arquivos"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--change)
            CHANGE_ID="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --no-backup)
            BACKUP=false
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validações iniciais
if [ -z "$CHANGE_ID" ]; then
    print_error "ID da change não especificado"
    show_help
    exit 1
fi

CHANGE_DIR="openspec/changes/active/$CHANGE_ID"
TASKS_FILE="$CHANGE_DIR/tasks.md"
BACKUP_FILE="$CHANGE_DIR/tasks.md.backup.$(date +%Y%m%d_%H%M%S)"

if [ ! -d "$CHANGE_DIR" ]; then
    print_error "Change $CHANGE_ID não encontrada em $CHANGE_DIR"
    exit 1
fi

if [ ! -f "$TASKS_FILE" ]; then
    print_error "Arquivo tasks.md não encontrado em $CHANGE_DIR"
    exit 1
fi

# Início da correção
print_header "Correção Automática - Change: $CHANGE_ID"

if [ "$DRY_RUN" = true ]; then
    print_warning "MODO DE SIMULAÇÃO - Nenhuma alteração será feita"
fi

# Criar backup (se habilitado)
if [ "$BACKUP" = true ] && [ "$DRY_RUN" = false ]; then
    cp "$TASKS_FILE" "$BACKUP_FILE"
    print_success "Backup criado: $BACKUP_FILE"
fi

# Variáveis para tracking
FIXES_APPLIED=0
TASKS_FIXED=()

# 1. Corrigir Agents sem stack especificada
print_header "1. Corrigindo Agents sem Stack"

# Mapeamento de prefixos para stacks padrão
declare -A PREFIX_TO_STACK=(
    ["domain:vo"]="(C#)"
    ["domain:entity"]="(C#)"
    ["domain:service"]="(C#)"
    ["app:dto"]="(C#)"
    ["app:usecase"]="(C#)"
    ["app:query"]="(C#)"
    ["infra:persistence"]="(C#)"
    ["interface:controller"]="(C#)"
    ["interface:entity"]="(Vue)"
    ["interface:usecase"]="(Vue)"
    ["interface:repository"]="(Vue)"
    ["interface:page"]="(Vue)"
    ["interface:form-web"]="(Vue)"
    ["interface:mobile-entity"]="(Android)"
    ["interface:mobile-usecase"]="(Android)"
    ["interface:mobile-repository"]="(Android)"
    ["interface:mobile"]="(Android)"
    ["test:unit"]="(C#)"
    ["test:e2e"]="(C#)"
    ["test:unit-web"]="(TypeScript)"
    ["test:unit-mobile"]="(Kotlin)"
)

# Ler arquivo tasks.md
TEMP_FILE=$(mktemp)
CURRENT_TASK_PREFIX=""
IN_TASK_BLOCK=false
TASK_LINES=()

# Processar linha por linha
while IFS= read -r line; do
    # Detectar início de uma task
    if [[ "$line" =~ ^-\ \[[ x]\]\ \`([^`]+)\` ]]; then
        # Se já estávamos em uma task, processar a anterior
        if [ "$IN_TASK_BLOCK" = true ]; then
            # Processar task anterior
            FIXED_TASK_LINES=()
            for task_line in "${TASK_LINES[@]}"; do
                # Corrigir Agent sem stack
                if [[ "$task_line" =~ \*\*Agent:\*\*\ \`([^`]+)\` ]]; then
                    AGENT_NAME="${BASH_REMATCH[1]}"
                    EXPECTED_STACK="${PREFIX_TO_STACK[$CURRENT_TASK_PREFIX]}"
                    
                    if [ -n "$EXPECTED_STACK" ] && [[ ! "$AGENT_NAME" =~ \( ]]; then
                        NEW_AGENT_NAME="$AGENT_NAME $EXPECTED_STACK"
                        FIXED_LINE="${task_line/$AGENT_NAME/$NEW_AGENT_NAME}"
                        
                        if [ "$VERBOSE" = true ]; then
                            print_info "Corrigindo Agent: $AGENT_NAME → $NEW_AGENT_NAME"
                        fi
                        
                        FIXED_TASK_LINES+=("$FIXED_LINE")
                        FIXES_APPLIED=$((FIXES_APPLIED + 1))
                        TASKS_FIXED+=("$CURRENT_TASK_PREFIX")
                    else
                        FIXED_TASK_LINES+=("$task_line")
                    fi
                else
                    FIXED_TASK_LINES+=("$task_line")
                fi
            done
            
            # Escrever task corrigida
            for fixed_line in "${FIXED_TASK_LINES[@]}"; do
                                echo "$fixed_line" >> "$TEMP_FILE"
            done
            
            # Resetar para nova task
            TASK_LINES=()
        fi
        
        # Nova task
        CURRENT_TASK_PREFIX="${BASH_REMATCH[1]}"
        IN_TASK_BLOCK=true
        TASK_LINES+=("$line")
    elif [ "$IN_TASK_BLOCK" = true ]; then
        # Continuar acumulando linhas da task atual
        TASK_LINES+=("$line")
        
        # Verificar se é fim da task (linha em branco ou próxima task)
        if [[ -z "$line" ]] || [[ "$line" =~ ^# ]]; then
            # Processar task atual
            FIXED_TASK_LINES=()
            for task_line in "${TASK_LINES[@]}"; do
                # Corrigir Agent sem stack
                if [[ "$task_line" =~ \*\*Agent:\*\*\ \`([^`]+)\` ]]; then
                    AGENT_NAME="${BASH_REMATCH[1]}"
                    EXPECTED_STACK="${PREFIX_TO_STACK[$CURRENT_TASK_PREFIX]}"
                    
                    if [ -n "$EXPECTED_STACK" ] && [[ ! "$AGENT_NAME" =~ \( ]]; then
                        NEW_AGENT_NAME="$AGENT_NAME $EXPECTED_STACK"
                        FIXED_LINE="${task_line/$AGENT_NAME/$NEW_AGENT_NAME}"
                        
                        if [ "$VERBOSE" = true ]; then
                            print_info "Corrigindo Agent: $AGENT_NAME → $NEW_AGENT_NAME"
                        fi
                        
                        FIXED_TASK_LINES+=("$FIXED_LINE")
                        FIXES_APPLIED=$((FIXES_APPLIED + 1))
                        TASKS_FIXED+=("$CURRENT_TASK_PREFIX")
                    else
                        FIXED_TASK_LINES+=("$task_line")
                    fi
                else
                    FIXED_TASK_LINES+=("$task_line")
                fi
            done
            
            # Escrever task corrigida
            for fixed_line in "${FIXED_TASK_LINES[@]}"; do
                echo "$fixed_line" >> "$TEMP_FILE"
            done
            
            # Resetar para próxima task
            IN_TASK_BLOCK=false
            TASK_LINES=()
            CURRENT_TASK_PREFIX=""
        fi
    else
        # Linha fora de task block
        echo "$line" >> "$TEMP_FILE"
    fi
done < "$TASKS_FILE"

# Processar última task se ainda estiver aberta
if [ "$IN_TASK_BLOCK" = true ] && [ ${#TASK_LINES[@]} -gt 0 ]; then
    FIXED_TASK_LINES=()
    for task_line in "${TASK_LINES[@]}"; do
        # Corrigir Agent sem stack
        if [[ "$task_line" =~ \*\*Agent:\*\*\ \`([^`]+)\` ]]; then
            AGENT_NAME="${BASH_REMATCH[1]}"
            EXPECTED_STACK="${PREFIX_TO_STACK[$CURRENT_TASK_PREFIX]}"
            
            if [ -n "$EXPECTED_STACK" ] && [[ ! "$AGENT_NAME" =~ \( ]]; then
                NEW_AGENT_NAME="$AGENT_NAME $EXPECTED_STACK"
                FIXED_LINE="${task_line/$AGENT_NAME/$NEW_AGENT_NAME}"
                
                if [ "$VERBOSE" = true ]; then
                    print_info "Corrigindo Agent: $AGENT_NAME → $NEW_AGENT_NAME"
                fi
                
                FIXED_TASK_LINES+=("$FIXED_LINE")
                FIXES_APPLIED=$((FIXES_APPLIED + 1))
                TASKS_FIXED+=("$CURRENT_TASK_PREFIX")
            else
                FIXED_TASK_LINES+=("$task_line")
            fi
        else
            FIXED_TASK_LINES+=("$task_line")
        fi
    done
    
    # Escrever task corrigida
    for fixed_line in "${FIXED_TASK_LINES[@]}"; do
        echo "$fixed_line" >> "$TEMP_FILE"
    done
fi

# 2. Corrigir prompts muito curtos
print_header "2. Corrigindo Prompts Curtos"

# Criar novo arquivo temporário para segunda passagem
TEMP_FILE2=$(mktemp)
while IFS= read -r line; do
    # Verificar se é um prompt muito curto
    if [[ "$line" =~ \*\*Prompt:\*\*\ \"([^\"]+)\" ]]; then
        PROMPT_TEXT="${BASH_REMATCH[1]}"
        
        if [[ ${#PROMPT_TEXT} -lt 10 ]]; then
            # Inferir prompt melhor baseado no prefixo da task
            # (buscar linha anterior para encontrar prefixo)
            if [[ "$line" =~ ^-\ \[[ x]\]\ \`([^`]+)\` ]]; then
                TASK_PREFIX="${BASH_REMATCH[1]}"
                
                # Gerar prompt sugerido baseado no prefixo
                case "$TASK_PREFIX" in
                    "domain:vo")
                        SUGGESTED_PROMPT="Crie um Value Object para [atributo] com validações apropriadas e método Create() retornando Result<T>."
                        ;;
                    "domain:entity")
                        SUGGESTED_PROMPT="Crie uma entidade de domínio [Nome] com regras de negócio, métodos de domínio e validações usando Result<T>."
                        ;;
                    "app:usecase")
                        SUGGESTED_PROMPT="Implemente o caso de uso [Nome]UseCase com injeção de repositório, validações de negócio e retorno Result<T>."
                        ;;
                    "interface:controller")
                        SUGGESTED_PROMPT="Crie o controller [Nome]Controller com endpoints HTTP, validação de input e mapeamento para use cases."
                        ;;
                    "interface:page")
                        SUGGESTED_PROMPT="Implemente a página [Nome]View com componentes Vue, estado reativo e integração com use cases."
                        ;;
                    *)
                        SUGGESTED_PROMPT="Implemente a task conforme especificado nos requisitos do épico."
                        ;;
                esac
                
                FIXED_LINE="  **Prompt:** \"$SUGGESTED_PROMPT\""
                
                if [ "$VERBOSE" = true ]; then
                    print_info "Corrigindo prompt curto: \"$PROMPT_TEXT\" → \"$SUGGESTED_PROMPT\""
                fi
                
                echo "$FIXED_LINE" >> "$TEMP_FILE2"
                FIXES_APPLIED=$((FIXES_APPLIED + 1))
            else
                echo "$line" >> "$TEMP_FILE2"
            fi
        else
            echo "$line" >> "$TEMP_FILE2"
        fi
    else
        echo "$line" >> "$TEMP_FILE2"
    fi
done < "$TEMP_FILE"

# 3. Adicionar tasks faltantes para ordem inside-out
print_header "3. Verificando Tasks Faltantes"

# Analisar tasks existentes
EXISTING_TASKS=()
while IFS= read -r line; do
    if [[ "$line" =~ ^-\ \[[ x]\]\ \`([^`]+)\` ]]; then
        EXISTING_TASKS+=("${BASH_REMATCH[1]}")
    fi
done < "$TEMP_FILE2"

# Verificar se há interface:page sem interface:entity antes
HAS_INTERFACE_PAGE=false
HAS_INTERFACE_ENTITY=false

for task in "${EXISTING_TASKS[@]}"; do
    if [ "$task" = "interface:page" ]; then
        HAS_INTERFACE_PAGE=true
    fi
    if [ "$task" = "interface:entity" ]; then
        HAS_INTERFACE_ENTITY=true
    fi
done

if [ "$HAS_INTERFACE_PAGE" = true ] && [ "$HAS_INTERFACE_ENTITY" = false ]; then
    print_warning "Encontrada interface:page sem interface:entity correspondente"
    
    # Adicionar task interface:entity antes da primeira interface:page
    if [ "$DRY_RUN" = false ]; then
        # Criar novo arquivo com task adicionada
        TEMP_FILE3=$(mktemp)
        ADDED_ENTITY=false
        
        while IFS= read -r line; do
            # Adicionar antes da primeira interface:page
            if [[ "$line" =~ ^-\ \[[ x]\]\ \`interface:page\` ]] && [ "$ADDED_ENTITY" = false ]; then
                echo "- [ ] \`interface:entity\` [Nome]Entity Vue (~1h)" >> "$TEMP_FILE3"
                echo "  **Agent:** \`Frontend Entity (Vue)\`" >> "$TEMP_FILE3"
                echo "  **Prompt:** \"Crie a entidade [Nome]Entity para frontend Vue com validações usando Result<T>.\"" >> "$TEMP_FILE3"
                echo "" >> "$TEMP_FILE3"
                ADDED_ENTITY=true
                FIXES_APPLIED=$((FIXES_APPLIED + 1))
                TASKS_FIXED+=("interface:entity")
            fi
            echo "$line" >> "$TEMP_FILE3"
        done < "$TEMP_FILE2"
        
        mv "$TEMP_FILE3" "$TEMP_FILE2"
    fi
fi

# Aplicar alterações (se não for dry run)
if [ "$DRY_RUN" = false ]; then
    # Criar backup do original
    if [ "$BACKUP" = true ]; then
        cp "$TASKS_FILE" "$BACKUP_FILE"
    fi
    
    # Substituir arquivo original
    mv "$TEMP_FILE2" "$TASKS_FILE"
    
    print_success "Arquivo tasks.md atualizado"
else
    print_info "Modo dry-run - Nenhuma alteração aplicada"
    rm "$TEMP_FILE" "$TEMP_FILE2"
fi

# Resumo final
print_header "📋 RESUMO DA CORREÇÃO"

echo "Change ID: $CHANGE_ID"
echo "Total de Tasks: ${#EXISTING_TASKS[@]}"
echo "Correções Aplicadas: $FIXES_APPLIED"
echo ""

if [ ${#TASKS_FIXED[@]} -gt 0 ]; then
    echo "Tasks Corrigidas:"
    for task in "${TASKS_FIXED[@]}"; do
        echo "  • $task"
    done
    echo ""
fi

if [ "$FIXES_APPLIED" -eq 0 ]; then
    print_success "✅ Nenhuma correção necessária"
    echo "O arquivo tasks.md já está em conformidade com as melhores práticas"
else
    if [ "$DRY_RUN" = true ]; then
        print_warning "⚠️  $FIXES_APPLIED correções identificadas (modo dry-run)"
        echo "Execute sem -d para aplicar as correções"
    else
        print_success "✅ $FIXES_APPLIED correções aplicadas com sucesso"
        
        if [ "$BACKUP" = true ]; then
            echo "Backup disponível em: $BACKUP_FILE"
        fi
    fi
fi

echo ""
print_info "Próximos passos:"
echo "1. Revisar as correções aplicadas"
echo "2. Executar validação: ./scripts/validate-advanced-dependencies.sh -c $CHANGE_ID"
echo "3. Aplicar change: openspec-apply-change $CHANGE_ID"

exit 0