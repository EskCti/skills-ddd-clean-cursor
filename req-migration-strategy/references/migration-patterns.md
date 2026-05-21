# Migration Patterns — Referência

## Strangler Fig

O padrão mais seguro para sistemas em produção. O novo sistema cresce ao redor do legado, substituindo funcionalidades incrementalmente até que o legado possa ser desligado.

### Implementação

1. Criar novo projeto com a arquitetura alvo (DDD/Clean)
2. Inserir uma façade/proxy (roteador) na frente do legado
3. Migrar um BC por vez: novo sistema assume o tráfego daquele BC
4. Legado continua funcionando para BCs ainda não migrados
5. Quando todos os BCs forem migrados, legado é desligado

### Roteamento

```
Opções de roteamento:
- Feature flag (env var por BC): FEATURE_NEW_AUTH=true
- Header HTTP: X-Use-New-System: auth
- Proxy reverso (nginx): location /api/auth { proxy_pass new_system; }
- API Gateway: route por prefixo de rota
```

### Critério de Cutover por BC

- Testes de paridade passando (parallel run)
- 100% do tráfego no novo sistema sem erros
- Dados migrados (ou sincronizados via event bridge)
- Rollback plan documentado

---

## Branch by Abstraction

Para componentes internos acoplados. Cria uma abstração sobre o componente legado e substitui a implementação gradualmente.

### Quando usar

- Componente interno que outras partes do sistema dependem
- Não há como criar um proxy externo (não é um serviço HTTP)
- Refatoração de biblioteca ou módulo interno

### Passos

1. Extrair interface `IXxxService` sobre o componente legado
2. Criar nova implementação `NewXxxService` do zero
3. Usar feature flag para alternar entre legado e novo
4. Remover implementação legada quando nova for estável

---

## Parallel Run

Executar legado e novo em paralelo, comparando resultados. Útil para validar paridade antes do cutover.

### Quando usar

- BCs Core com alta criticidade
- Dados financeiros ou de saúde
- Regulamentação exige validação

### Implementação

```
Request ──▶ Roteador ──▶ Legado   ──▶ Resultado A ─┐
                    │                              ├──▶ Comparador ──▶ Alert se divergir
                    └──▶ Novo Sistema ──▶ Resultado B ─┘
```

- Resposta ao cliente vem sempre do legado (durante validação)
- Divergências são logadas para análise
- Quando 0 divergências por N dias → cutover para novo sistema

---

## Anti-Corruption Layer (ACL)

### Componentes

| Componente | Responsabilidade | Camada |
|------------|-----------------|--------|
| `Legacy<Xxx>Adapter` | Consulta o legado (HTTP, banco direto, RPC) | Infrastructure |
| `Legacy<Xxx>Mapper` | Traduz estrutura legada → Entity/VO do domínio | Infrastructure |
| `I<Xxx>LegacyPort` | Interface do domínio para o legado | Domain |
| `<Xxx>Facade` | Orquestra adapter + mapper | Application |

### Exemplo — Customer (PHP legado → C# novo)

```csharp
// Domain port
public interface ILegacyCustomerPort
{
    Task<Result<Customer>> FindByLegacyId(string legacyId);
}

// Infrastructure adapter (lê do banco legado via HTTP ou direto)
public class LegacyCustomerAdapter : ILegacyCustomerPort
{
    public async Task<Result<Customer>> FindByLegacyId(string legacyId)
    {
        var legacyDto = await _legacyHttpClient.GetAsync($"/api/clientes/{legacyId}");
        return LegacyCustomerMapper.ToDomain(legacyDto);
    }
}

// Mapper — traduz campos legados para VOs do domínio
public static class LegacyCustomerMapper
{
    public static Result<Customer> ToDomain(LegacyClienteDto dto)
    {
        var name = CustomerName.Create(dto.NmCli);
        var email = Email.Create(dto.CdEmail);
        // ... combinação de Results
        return Customer.Create(name.Value, email.Value);
    }
}
```

### Quando remover a ACL

A ACL é temporária. Remover quando:
- O BC correspondente foi totalmente migrado
- Nenhum dado é mais lido do legado para este BC
- Testes do novo sistema passam sem a ACL

---

## Checklist de Migração por BC

- [ ] Discovery do BC no legado concluído
- [ ] Modelo DDD (entities, VOs, use cases) definido
- [ ] ACL desenhada (se necessário)
- [ ] Scaffold do novo módulo criado (`config-new-module[-kt|-cs]`)
- [ ] Implementação DDD completa (domain → app → infra → interface)
- [ ] Testes unitários e e2e cobrindo o BC
- [ ] Parallel run validado (se BC Core)
- [ ] Cutover executado (roteador apontando 100% para novo)
- [ ] Dados migrados ou sincronizados
- [ ] ACL removida
- [ ] Tabelas/código legado arquivados
