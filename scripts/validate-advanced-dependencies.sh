#!/bin/bash

# Script de Validação Avançada de Dependências para OpenSpec
# Versão: 2.0.0
# Propósito: Validar dependências, cache de contexto e métricas de performance

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
CHANGE_ID=""
VERBOSE=false
FIX_AUTO=false
CHECK_CACHE=true
GENERATE_REPORT=true
REPORT_FILE=""

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
    echo "Valida dependências, cache de contexto e métricas de performance para changes OpenSpec"
    echo ""
    echo "Opções:"
    echo "  -c, --change ID        ID da change OpenSpec (ex: EP-001)"
    echo "  -f, --fix              Aplicar correções automáticas quando possível"
    echo "  -v, --verbose          Modo verboso"
    echo "  --no-cache             Não validar cache de contexto"
    echo "  --no-report            Não gerar relatório"
    echo "  -o, --output FILE      Arquivo de saída para relatório (padrão: validation-report-<CHANGE>.md)"
    echo "  -h, --help             Exibir esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 -c EP-001           Validar change EP-001"
    echo "  $0 -c EP-001 -f        Validar e corrigir automaticamente"
    echo "  $0 -c EP-001 -v -o relatorio.md  Validar com verbose e salvar relatório"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--change)
            CHANGE_ID="$2"
            shift 2
            ;;
        -f|--fix)
            FIX_AUTO=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --no-cache)
            CHECK_CACHE=false
            shift
            ;;
        --no-report)
            GENERATE_REPORT=false
            shift
            ;;
        -o|--output)
            REPORT_FILE="$2"
            shift 2
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

if [ -z "$REPORT_FILE" ]; then
    REPORT_FILE="validation-report-$CHANGE_ID.md"
fi

CHANGE_DIR="openspec/changes/active/$CHANGE_ID"
TASKS_FILE="$CHANGE_DIR/tasks.md"

if [ ! -d "$CHANGE_DIR" ]; then
    print_error "Change $CHANGE_ID não encontrada em $CHANGE_DIR"
    exit 1
fi

if [ ! -f "$TASKS_FILE" ]; then
    print_error "Arquivo tasks.md não encontrado em $CHANGE_DIR"
    exit 1
fi

# Início da validação
print_header "Validação Avançada - Change: $CHANGE_ID"
echo ""

# 1. Validar estrutura básica
print_header "1. Validação de Estrutura Básica"

if [ ! -f "$CHANGE_DIR/proposal.md" ]; then
    print_warning "Arquivo proposal.md não encontrado"
else
    print_success "proposal.md encontrado"
fi

if [ ! -f "$CHANGE_DIR/design.md" ]; then
    print_warning "Arquivo design.md não encontrado"
else
    print_success "design.md encontrado"
fi

# 2. Validar tasks.md
print_header "2. Análise do Arquivo tasks.md"

TASK_COUNT=$(grep -c "^- \[ \]" "$TASKS_FILE" || true)
print_info "Total de tasks encontradas: $TASK_COUNT"

if [ $TASK_COUNT -eq 0 ]; then
    print_error "Nenhuma task encontrada em tasks.md"
    exit 1
fi

# 3. Validar ordem Clean Architecture
print_header "3. Validação de Ordem Clean Architecture"

# Mapeamento de camadas e ordem esperada
declare -A LAYER_ORDER=(
    ["domain:vo"]=1
    ["domain:entity"]=2
    ["domain:service"]=3
    ["app:dto"]=4
    ["app:usecase"]=5
    ["app:query"]=6
    ["infra:persistence"]=7
    ["interface:controller"]=8
    ["interface:entity"]=9
    ["interface:usecase"]=10
    ["interface:repository"]=11
    ["interface:page"]=12
    ["interface:form-web"]=13
    ["interface:mobile-entity"]=14
    ["interface:mobile-usecase"]=15
    ["interface:mobile-repository"]=16
    ["interface:mobile"]=17
    ["test:unit"]=18
    ["test:e2e"]=19
    ["test:unit-web"]=20
    ["test:unit-mobile"]=21
)

# Extrair tasks e validar ordem
CURRENT_LAYER=0
ORDER_ERRORS=0
TASK_DETAILS=()

while IFS= read -r line; do
    if [[ "$line" =~ ^-\ \[[ x]\]\ \`([^`]+)\` ]]; then
        TASK_PREFIX="${BASH_REMATCH[1]}"
        
        if [ -n "${LAYER_ORDER[$TASK_PREFIX]}" ]; then
            EXPECTED_ORDER=${LAYER_ORDER[$TASK_PREFIX]}
            
            if [ $EXPECTED_ORDER -lt $CURRENT_LAYER ]; then
                print_error "Ordem incorreta: $TASK_PREFIX (esperado antes de camada $CURRENT_LAYER)"
                ORDER_ERRORS=$((ORDER_ERRORS + 1))
                
                if [ "$FIX_AUTO" = true ]; then
                    print_warning "Correção automática não implementada para reordenação"
                fi
            else
                CURRENT_LAYER=$EXPECTED_ORDER
                if [ "$VERBOSE" = true ]; then
                    print_success "Ordem correta: $TASK_PREFIX"
                fi
            fi
            
            # Extrair detalhes da task
            TASK_DETAILS+=("$TASK_PREFIX")
        else
            print_warning "Prefixo desconhecido: $TASK_PREFIX"
        fi
    fi
done < "$TASKS_FILE"

if [ $ORDER_ERRORS -eq 0 ]; then
    print_success "Ordem Clean Architecture válida"
else
    print_error "Encontrados $ORDER_ERRORS erros de ordem"
fi

# 4. Validar Agents e Skills
print_header "4. Validação de Agents e Skills"

AGENT_ERRORS=0
while IFS= read -r line; do
    if [[ "$line" =~ \*\*Agent:\*\*\ \`([^`]+)\` ]]; then
        AGENT_NAME="${BASH_REMATCH[1]}"
        
        # Verificar se agent tem stack especificada
        if [[ ! "$AGENT_NAME" =~ \(C#\)|\(Vue\)|\(Android\)|\(TypeScript\)|\(Kotlin\) ]]; then
            print_error "Agent sem stack especificada: $AGENT_NAME"
            AGENT_ERRORS=$((AGENT_ERRORS + 1))
            
            if [ "$FIX_AUTO" = true ]; then
                # Tentar inferir stack baseado no prefixo da task
                # (implementação simplificada)
                print_warning "Correção automática de stack não implementada"
            fi
        else
            if [ "$VERBOSE" = true ]; then
                print_success "Agent válido: $AGENT_NAME"
            fi
        fi
    fi
done < "$TASKS_FILE"

if [ $AGENT_ERRORS -eq 0 ]; then
    print_success "Todos os Agents são válidos"
else
    print_error "Encontrados $AGENT_ERRORS Agents inválidos"
fi

# 5. Validar Cache de Contexto (se habilitado)
if [ "$CHECK_CACHE" = true ]; then
    print_header "5. Validação de Cache de Contexto"
    
    # Verificar se há tasks que podem se beneficiar de cache
    CACHE_OPPORTUNITIES=0
    VO_TASKS=$(grep -c "domain:vo" "$TASKS_FILE" || true)
    ENTITY_TASKS=$(grep -c "domain:entity" "$TASKS_FILE" || true)
    
    if [ $VO_TASKS -gt 1 ]; then
        print_info "Opportunidade de cache: $VO_TASKS Value Objects podem ser cacheados"
        CACHE_OPPORTUNITIES=$((CACHE_OPPORTUNITIES + VO_TASKS - 1))
    fi
    
    if [ $ENTITY_TASKS -gt 1 ]; then
        print_info "Opportunidade de cache: $ENTITY_TASKS Entities podem ser cacheados"
        CACHE_OPPORTUNITIES=$((CACHE_OPPORTUNITIES + ENTITY_TASKS - 1))
    fi
    
    if [ $CACHE_OPPORTUNITIES -gt 0 ]; then
        print_warning "Considerar implementar cache de contexto para $CACHE_OPPORTUNITIES tasks"
    else
        print_success "Cache de contexto otimizado"
    fi
fi

# 6. Validar Dependências Explícitas
print_header "6. Validação de Dependências Explícitas"

DEPENDENCY_ERRORS=0
CURRENT_TASK=""
TASK_MAP=()

# Primeiro passagem: mapear todas as tasks
while IFS= read -r line; do
    if [[ "$line" =~ ^-\ \[[ x]\]\ \`([^`]+)\` ]]; then
        TASK_PREFIX="${BASH_REMATCH[1]}"
        CURRENT_TASK="$TASK_PREFIX"
        TASK_MAP+=("$TASK_PREFIX")
    fi
    
    # Verificar dependências
    if [[ "$line" =~ \*\*Dependencies:\*\*\ \[([^]]+)\] ]]; then
        DEPS="${BASH_REMATCH[1]}"
        IFS=',' read -ra DEP_ARRAY <<< "$DEPS"
        
        for DEP in "${DEP_ARRAY[@]}"; do
            DEP=$(echo "$DEP" | tr -d ' ')
            if [[ ! " ${TASK_MAP[@]} " =~ " ${DEP} " ]]; then
                print_error "Dependência não encontrada: $CURRENT_TASK depende de $DEP"
                DEPENDENCY_ERRORS=$((DEPENDENCY_ERRORS + 1))
            fi
        done
    fi
done < "$TASKS_FILE"

if [ $DEPENDENCY_ERRORS -eq 0 ]; then
    print_success "Todas as dependências são válidas"
else
    print_error "Encontradas $DEPENDENCY_ERRORS dependências inválidas"
fi

# 7. Validar Prompts
print_header "7. Validação de Prompts"

PROMPT_ERRORS=0
while IFS= read -r line; do
    if [[ "$line" =~ \*\*Prompt:\*\*\ \"([^\"]+)\" ]]; then
        PROMPT_TEXT="${BASH_REMATCH[1]}"
        
        # Verificar qualidade do prompt
        if [[ ${#PROMPT_TEXT} -lt 10 ]]; then
            print_error "Prompt muito curto: \"$PROMPT_TEXT\""
            PROMPT_ERRORS=$((PROMPT_ERRORS + 1))
        fi
        
        if [[ "$PROMPT_TEXT" == *"TODO"* ]] || [[ "$PROMPT_TEXT" == *"FIXME"* ]]; then
            print_warning "Prompt contém placeholder: \"$PROMPT_TEXT\""
        fi
    fi
done < "$TASKS_FILE"

if [ $PROMPT_ERRORS -eq 0 ]; then
    print_success "Todos os prompts são válidos"
else
    print_error "Encontrados $PROMPT_ERRORS prompts inválidos"
fi

# 8. Gerar relatório (se habilitado)
if [ "$GENERATE_REPORT" = true ]; then
    print_header "8. Gerando Relatório de Validação"
    
    TOTAL_ERRORS=$((ORDER_ERRORS + AGENT_ERRORS + DEPENDENCY_ERRORS + PROMPT_ERRORS))
    
    cat > "$REPORT_FILE" << EOF
# Relatório de Validação - Change: $CHANGE_ID

**Data da Validação**: $(date)
**Change ID**: $CHANGE_ID
**Arquivo Analisado**: $TASKS_FILE

---

## 📊 **Resumo da Validação**

| Métrica | Valor | Status |
|---------|-------|--------|
| Total de Tasks | $TASK_COUNT | ✅ |
| Erros de Ordem | $ORDER_ERRORS | $( [ $ORDER_ERRORS -eq 0 ] && echo "✅" || echo "❌" ) |
| Agents Inválidos | $AGENT_ERRORS | $( [ $AGENT_ERRORS -eq 0 ] && echo "✅" || echo "❌" ) |
| Dependências Inválidas | $DEPENDENCY_ERRORS | $( [ $DEPENDENCY_ERRORS -eq 0 ] && echo "✅" || echo "❌" ) |
| Prompts Inválidos | $PROMPT_ERRORS | $( [ $PROMPT_ERRORS -eq 0 ] && echo "✅" || echo "❌" ) |
| **Total de Erros** | **$TOTAL_ERRORS** | **$( [ $TOTAL_ERRORS -eq 0 ] && echo "✅ VÁLIDO" || echo "❌ INVÁLIDO" )** |

---

## 🔍 **Detalhes da Validação**

### 1. Estrutura Básica
- ✅ Arquivo tasks.md encontrado
$( [ -f "$CHANGE_DIR/proposal.md" ] && echo "- ✅ Arquivo proposal.md encontrado" || echo "- ⚠️  Arquivo proposal.md não encontrado" )
$( [ -f "$CHANGE_DIR/design.md" ] && echo "- ✅ Arquivo design.md encontrado" || echo "- ⚠️  Arquivo design.md não encontrado" )

### 2. Ordem Clean Architecture
$( [ $ORDER_ERRORS -eq 0 ] && echo "- ✅ Ordem inside-out válida" || echo "- ❌ $ORDER_ERRORS tasks fora de ordem" )

### 3. Agents e Skills
$( [ $AGENT_ERRORS -eq 0 ] && echo "- ✅ Todos os Agents são válidos" || echo "- ❌ $AGENT_ERRORS Agents inválidos" )

### 4. Dependências Explícitas
$( [ $DEPENDENCY_ERRORS -eq 0 ] && echo "- ✅ Todas as dependências são válidas" || echo "- ❌ $DEPENDENCY_ERRORS dependências inválidas" )

### 5. Qualidade dos Prompts
$( [ $PROMPT_ERRORS -eq 0 ] && echo "- ✅ Todos os prompts são válidos" || echo "- ❌ $PROMPT_ERRORS prompts inválidos" )

$( [ "$CHECK_CACHE" = true ] && echo "
### 6. Cache de Contexto
- ℹ️  Opportunidades de cache identificadas: $CACHE_OPPORTUNITIES
" )

---

## 🚨 **Problemas Identificados**

$( if [ $TOTAL_ERRORS -eq 0 ]; then
    echo "Nenhum problema identificado. A change está pronta para execução."
else
    echo "Foram identificados $TOTAL_ERRORS problemas que precisam ser corrigidos antes da execução."
fi )

---

## 🔧 **Recomendações**

$( if [ $ORDER_ERRORS -gt 0 ]; then
    echo "1. **Reordenar tasks**: Siga a ordem Clean Architecture (inside-out)"
fi )

$( if [ $AGENT_ERRORS -gt 0 ]; then
    echo "2. **Corrigir Agents**: Especifique a stack (ex: \`(C#)\`, \`(Vue)\`, \`(Android)\`)"
fi )

$( if [ $DEPENDENCY_ERRORS -gt 0 ]; then
    echo "3. **Corrigir dependências**: Verifique se todas as tasks dependentes existem"
fi )

$( if [ $PROMPT_ERRORS -gt 0 ]; then
    echo "4. **Melhorar prompts**: Use prompts específicos e detalhados"
fi )

$( if [ $CACHE_OPPORTUNITIES -gt 0 ]; then
    echo "5. **Implementar cache**: Considere usar cache de contexto para otimizar performance"
fi )

---

## 📋 **Próximos Passos**

$( if [ $TOTAL_ERRORS -eq 0 ]; then
    echo "1. ✅ Change validada com sucesso"
    echo "2. 🚀 Pronto para executar: \`openspec-apply-change $CHANGE_ID\`"
else
    echo "1. ❌ Corrigir os $TOTAL_ERRORS problemas identificados"
    echo "2. 🔄 Reexecutar validação: \`$0 -c $CHANGE_ID\`"
    echo "3. 🚀 Após correções, executar: \`openspec-apply-change $CHANGE_ID\`"
fi )

---

**Relatório gerado em**: $(date)  
**Script versão**: 2.0.0  
**Status**: $( [ $TOTAL_ERRORS -eq 0 ] && echo "✅ APROVADO" || echo "❌ REPROVADO" )
EOF
    
    print_success "Relatório gerado em: $REPORT_FILE"
fi

# Resumo final
print_header "📋 RESUMO DA VALIDAÇÃO"

TOTAL_ERRORS=$((ORDER_ERRORS + AGENT_ERRORS + DEPENDENCY_ERRORS + PROMPT_ERRORS))

echo "Change ID: $CHANGE_ID"
echo "Total de Tasks: $TASK_COUNT"
echo ""
echo "Erros de Ordem: $ORDER_ERRORS"
echo "Agents Inválidos: $AGENT_ERRORS"
echo "Dependências Inválidas: $DEPENDENCY_ERRORS"
echo "Prompts Inválidos: $PROMPT_ERRORS"
echo ""
echo "TOTAL DE ERROS: $TOTAL_ERRORS"
echo ""

if [ $TOTAL_ERRORS -eq 0 ]; then
    print_success "✅ VALIDAÇÃO APROVADA"
    echo "A change está pronta para execução com openspec-apply-change"
else
    print_error "❌ VALIDAÇÃO REPROVADA"
    echo "Corrija os problemas antes de executar openspec-apply-change"
    
    if [ "$FIX_AUTO" = true ]; then
        print_warning "Modo de correção automática habilitado, mas algumas correções requerem intervenção manual"
    fi
fi

echo ""
print_info "Relatório detalhado: $REPORT_FILE"

exit $TOTAL_ERRORS