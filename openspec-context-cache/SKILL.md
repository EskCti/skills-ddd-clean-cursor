# OpenSpec Context Cache

**Skill**: `openspec-context-cache`  
**Tecnologia**: TypeScript/Node.js  
**Propósito**: Gerenciar cache de contexto compartilhado entre skills durante o ciclo OpenSpec

---

## 📋 **Visão Geral**

O **OpenSpec Context Cache** é um sistema de cache que permite compartilhar contexto entre diferentes skills durante a execução de uma mudança OpenSpec. Isso otimiza o workflow evitando recálculos desnecessários e mantendo consistência entre tasks relacionadas.

### **Problema Resolvido**
- Skills independentes não compartilham contexto
- Recálculo de informações comuns entre tasks
- Inconsistência entre tasks relacionadas
- Perda de tempo com inicializações repetidas

### **Solução**
- Cache centralizado por mudança OpenSpec
- Contexto compartilhado entre skills
- Validade baseada em tempo e dependências
- Integração transparente com workflow

---

## 🎯 **Objetivos**

### **Funcionalidades Principais**
1. **Cache por Mudança**: Contexto isolado por `change_id`
2. **Tipagem Forte**: TypeScript com interfaces definidas
3. **Validação Automática**: Verificação de dependências
4. **Integração com Skills**: API simples para get/set
5. **Persistência Opcional**: Cache em memória ou arquivo

### **Benefícios**
- ✅ **Performance**: Redução de recálculos
- ✅ **Consistência**: Dados uniformes entre skills
- ✅ **Produtividade**: Menos configurações manuais
- ✅ **Qualidade**: Menos erros de inconsistência

---

## 🏗️ **Arquitetura**

### **Componentes**

```
┌─────────────────────────────────────────────────┐
│            OpenSpec Context Cache                │
├─────────────────────────────────────────────────┤
│  ContextManager                                 │
│  ├── get<T>(key: string): T | null              │
│  ├── set<T>(key: string, value: T): void        │
│  ├── has(key: string): boolean                  │
│  └── clear(): void                              │
│                                                 │
│  ChangeContext                                  │
│  ├── changeId: string                           │
│  ├── createdAt: Date                            │
│  ├── lastAccessed: Date                         │
│  └── data: Map<string, any>                     │
│                                                 │
│  PersistenceAdapter                             │
│  ├── memory: MemoryAdapter                      │
│  └── file: FileAdapter                          │
└─────────────────────────────────────────────────┘
```

### **Fluxo de Trabalho**

```
1. Skill inicia execução
   ↓
2. Obtém ContextManager para change_id
   ↓
3. Verifica cache para dados necessários
   ↓
4. Se cache hit → usa dados cacheados
   ↓
5. Se cache miss → calcula e armazena
   ↓
6. Retorna resultado
```

---

## 🔧 **Implementação**

### **1. Interface Principal**

```typescript
// packages/shared-core/src/context/context-manager.interface.ts
export interface IContextManager {
  /**
   * Obtém valor do cache
   */
  get<T>(key: string): T | null;
  
  /**
   * Armazena valor no cache
   */
  set<T>(key: string, value: T): void;
  
  /**
   * Verifica se chave existe no cache
   */
  has(key: string): boolean;
  
  /**
   * Remove chave do cache
   */
  delete(key: string): boolean;
  
  /**
   * Limpa todo o cache da mudança
   */
  clear(): void;
  
  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
}
```

### **2. Implementação Concreta**

```typescript
// packages/shared-core/src/context/context-manager.ts
export class ContextManager implements IContextManager {
  private readonly changeId: string;
  private readonly data: Map<string, any>;
  private stats: CacheStats;
  
  constructor(changeId: string) {
    this.changeId = changeId;
    this.data = new Map();
    this.stats = { hits: 0, misses: 0, size: 0, memoryUsage: 0 };
  }
  
  get<T>(key: string): T | null {
    if (this.data.has(key)) {
      this.stats.hits++;
      return this.data.get(key) as T;
    }
    
    this.stats.misses++;
    return null;
  }
  
  set<T>(key: string, value: T): void {
    this.data.set(key, value);
    this.stats.size = this.data.size;
    // Atualizar uso de memória
    this.updateMemoryUsage();
  }
  
  has(key: string): boolean {
    return this.data.has(key);
  }
  
  delete(key: string): boolean {
    const deleted = this.data.delete(key);
    if (deleted) {
      this.stats.size = this.data.size;
      this.updateMemoryUsage();
    }
    return deleted;
  }
  
  clear(): void {
    this.data.clear();
    this.stats.size = 0;
    this.stats.memoryUsage = 0;
  }
  
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  private updateMemoryUsage(): void {
    // Implementação simplificada
    this.stats.memoryUsage = this.data.size * 1024; // ~1KB por entrada
  }
}
```

### **3. Factory para Acesso**

```typescript
// packages/shared-core/src/context/context-factory.ts
export class ContextFactory {
  private static instances: Map<string, ContextManager> = new Map();
  
  /**
   * Obtém ContextManager para uma mudança OpenSpec
   */
  static getManager(changeId: string): ContextManager {
    if (!this.instances.has(changeId)) {
      this.instances.set(changeId, new ContextManager(changeId));
    }
    
    return this.instances.get(changeId)!;
  }
  
  /**
   * Libera ContextManager da memória
   */
  static releaseManager(changeId: string): void {
    this.instances.delete(changeId);
  }
  
  /**
   * Limpa todos os ContextManagers
   */
  static clearAll(): void {
    this.instances.clear();
  }
}
```

---

## 🗝️ **Chaves de Cache Padronizadas**

### **Domínio Compartilhado**
```typescript
// Chaves comuns entre BCs
export const CACHE_KEYS = {
  // Value Objects reutilizáveis
  DOMAIN_VO: {
    MONEY: 'domain:vo:money',
    EMAIL: 'domain:vo:email',
    PHONE: 'domain:vo:phone',
    ADDRESS: 'domain:vo:address',
  },
  
  // Configurações do projeto
  PROJECT: {
    STACK: 'project:stack',
    TENANT_STRATEGY: 'project:tenant-strategy',
    AUTH_PROVIDER: 'project:auth-provider',
    DATABASE: 'project:database',
  },
  
  // Configurações de BC
  BC_CONFIG: {
    AUTH: 'bc:config:auth',
    PLATFORM: 'bc:config:platform',
    CATALOG: 'bc:config:catalog',
    SALES: 'bc:config:sales',
  },
  
  // Dados calculados
  CALCULATED: {
    DEPENDENCY_GRAPH: 'calculated:dependency-graph',
    TASK_ORDER: 'calculated:task-order',
    DURATION_ESTIMATE: 'calculated:duration-estimate',
  },
} as const;
```

### **Exemplo de Uso**

```typescript
// Em um skill de domínio
import { ContextFactory, CACHE_KEYS } from '@retailops/shared-core/context';

export class UserEntityService {
  private context = ContextFactory.getManager('ep-001-auth');
  
  createUser(email: string, password: string): Result<User> {
    // Verifica se Email VO já está no cache
    const emailVo = this.context.get(CACHE_KEYS.DOMAIN_VO.EMAIL);
    
    if (!emailVo) {
      // Calcula e armazena no cache
      const newEmailVo = EmailVO.create(email);
      if (newEmailVo.isFailure()) {
        return Result.fail(newEmailVo.error);
      }
      
      this.context.set(CACHE_KEYS.DOMAIN_VO.EMAIL, newEmailVo.value);
      return this.createUserWithEmail(newEmailVo.value, password);
    }
    
    // Reutiliza do cache
    return this.createUserWithEmail(emailVo, password);
  }
}
```

---

## 🔄 **Integração com Skills**

### **1. Modificação de Skills Existentes**

#### **Skill de Domínio (ex: `core-entity-cs`)**
```typescript
// Adicionar ao início do skill
const context = ContextFactory.getManager(changeId);

// Verificar cache antes de calcular
const cachedEntity = context.get(`domain:entity:${entityName}`);
if (cachedEntity) {
  return cachedEntity;
}

// Calcular e armazenar
const entity = calculateEntity();
context.set(`domain:entity:${entityName}`, entity);
```

#### **Skill de Aplicação (ex: `core-use-case-cs`)**
```typescript
// Reutilizar Value Objects do cache
const emailVo = context.get(CACHE_KEYS.DOMAIN_VO.EMAIL);
const passwordVo = context.get(CACHE_KEYS.DOMAIN_VO.PASSWORD);

if (!emailVo || !passwordVo) {
  // Calcular se não estiverem no cache
  // ...
}
```

### **2. Novo Skill: `openspec-context-cache`**

```yaml
# .agents/skills/openspec-context-cache/skill.yaml
name: openspec-context-cache
description: Gerencia cache de contexto compartilhado entre skills OpenSpec
version: 1.0.0
language: typescript
entrypoint: src/index.ts

dependencies:
  - "@retailops/shared-core": "^1.0.0"

commands:
  - name: get
    description: Obtém valor do cache
    usage: openspec-context-cache get <change-id> <key>
    
  - name: set
    description: Armazena valor no cache
    usage: openspec-context-cache set <change-id> <key> <value>
    
  - name: stats
    description: Exibe estatísticas do cache
    usage: openspec-context-cache stats <change-id>
    
  - name: clear
    description: Limpa cache da mudança
    usage: openspec-context-cache clear <change-id>
```

---

## 📊 **Estatísticas e Monitoramento**

### **Métricas Coletadas**
```typescript
interface CacheMetrics {
  // Por mudança
  changeId: string;
  totalHits: number;
  totalMisses: number;
  hitRate: number; // hits / (hits + misses)
  totalSize: number;
  memoryUsageBytes: number;
  
  // Por chave
  keyStats: Map<string, {
    hits: number;
    lastAccessed: Date;
    sizeBytes: number;
  }>;
  
  // Performance
  averageGetTimeMs: number;
  averageSetTimeMs: number;
}
```

### **Dashboard de Monitoramento**
```
┌─────────────────────────────────────────────────┐
│           OpenSpec Cache Dashboard              │
├─────────────────────────────────────────────────┤
│ Change ID: ep-001-auth                          │
│ Status: 🟢 Active                               │
│                                                 │
│ 📊 Statistics                                   │
│   Hits: 142     Misses: 28     Hit Rate: 83.5%  │
│   Size: 45 entries     Memory: 46.1 KB          │
│                                                 │
│ 🔑 Top Keys (by hits)                           │
│   1. domain:vo:email (42 hits)                  │
│   2. domain:vo:password (38 hits)               │
│   3. project:stack (22 hits)                    │
│   4. bc:config:auth (18 hits)                   │
│   5. calculated:dependency-graph (12 hits)      │
│                                                 │
│ ⚡ Performance                                   │
│   Avg Get Time: 0.8ms    Avg Set Time: 1.2ms    │
└─────────────────────────────────────────────────┘
```

---

## 🚀 **Workflow Otimizado com Cache**

### **Antes (Sem Cache)**
```
Skill A: Calcula EmailVO → Armazena localmente
Skill B: Calcula EmailVO novamente → Desperdício
Skill C: Calcula EmailVO novamente → Desperdício
```

### **Depois (Com Cache)**
```
Skill A: Calcula EmailVO → Armazena no cache compartilhado
Skill B: Obtém EmailVO do cache → Reutilização
Skill C: Obtém EmailVO do cache → Reutilização
```

### **Estimativa de Economia**
| Cenário | Tempo Sem Cache | Tempo Com Cache | Economia |
|---------|-----------------|-----------------|----------|
| **EmailVO** | 3 × 5min = 15min | 5min + 2 × 0.1s | ~10min |
| **Project Config** | 5 × 2min = 10min | 2min + 4 × 0.1s | ~8min |
| **Dependency Graph** | 3 × 3min = 9min | 3min + 2 × 0.2s | ~6min |

**Total estimado por mudança**: ~24min economizados

---

## 🔧 **Configuração**

### **1. Instalação**
```bash
# Adicionar ao package.json do shared-core
npm install --save @retailops/shared-core
```

### **2. Configuração do Cache**
```typescript
// apps/backend/src/config/cache.config.ts
export const cacheConfig = {
  // TTL padrão (Time To Live)
  defaultTTL: 3600, // 1 hora em segundos
  
  // Tamanho máximo do cache
  maxSize: 1000, // entradas
  
  // Estratégia de evicção
  evictionPolicy: 'lru', // Least Recently Used
  
  // Persistência
  persistence: {
    enabled: false,
    filePath: './cache/openspec-context.json',
    autoSaveInterval: 300, // 5 minutos
  },
};
```

### **3. Integração com OpenSpec**
```yaml
# openspec/changes/ep-001-auth/proposal.md
cache_config:
  enabled: true
  ttl: 7200  # 2 horas
  shared_keys:
    - domain:vo:email
    - domain:vo:password
    - project:stack
```

---

## 📋 **Checklist de Implementação**

### **Fase 1: Core Infrastructure** ✅
- [x] Definir interfaces `IContextManager`
- [x] Implementar `ContextManager` básico
- [x] Criar `ContextFactory` para acesso
- [x] Definir chaves de cache padronizadas

### **Fase 2: Integration** 🟡
- [ ] Modificar skills principais para usar cache
  - [ ] `core-value-object-cs`
  - [ ] `core-entity-cs`
  - [ ] `core-use-case-cs`
  - [ ] `backend-controller-cs`
- [ ] Criar skill `openspec-context-cache`
- [ ] Adicionar comandos CLI

### **Fase 3: Monitoring** ⏳
- [ ] Implementar coleta de métricas
- [ ] Criar dashboard de monitoramento
- [ ] Adicionar logs detalhados
- [ ] Configurar alertas

### **Fase 4: Optimization** ⏳
- [ ] Adicionar persistência em arquivo
- [ ] Implementar compressão
- [ ] Otimizar uso de memória
- [ ] Adicionar cache distribuído

---

## 🔗 **Integração com Outras Ferramentas**

### **OpenSpec Validate Dependencies**
```typescript
// Reutiliza gráfico de dependências do cache
const dependencyGraph = context.get(CACHE_KEYS.CALCULATED.DEPENDENCY_GRAPH);
if (!dependencyGraph) {
  // Calcula e armazena
  const graph = calculateDependencyGraph(tasks);
  context.set(CACHE_KEYS.CALCULATED.DEPENDENCY_GRAPH, graph);
  return graph;
}
return dependencyGraph;
```

### **Dashboard de Progresso**
```typescript
// Obtém estatísticas do cache para exibição
const cacheStats = ContextFactory.getManager(changeId).getStats();
dashboard.updateCacheMetrics(cacheStats);
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/ci.yml
- name: Validate cache consistency
  run: |
    dotnet run --project tools/OpenSpecCacheValidator -- validate ep-001-auth
```

---

## 🚨 **Considerações de Segurança**

### **Isolamento por Tenant**
```typescript
// Cache isolado por tenantId
const cacheKey = `${tenantId}:${originalKey}`;
context.set(cacheKey, value);
```

### **Limpeza Automática**
```typescript
// Limpar cache após mudança arquivada
openspec-archive-change.onComplete(() => {
  ContextFactory.releaseManager(changeId);
});
```

### **Validação de Dados**
```typescript
// Verificar integridade dos dados cacheados
if (cachedData && isValid(cachedData)) {
  return cachedData;
}
// Recalcular se dados inválidos
```

---

## 📈 **Roadmap**

### **Versão 1.0 (Atual)**
- ✅ Cache em memória básico
- ✅ Integração com skills principais
- ✅ Estatísticas básicas

### **Versão 1.1 (Próxima)**
- 🟡 Persistência em arquivo
- 🟡 Compressão de dados
- 🟡 Dashboard de monitoramento

### **Versão 2.0 (Futuro)**
- ⏳ Cache distribuído (Redis)
- ⏳ Replicação entre instâncias
- ⏳ Integração com CI/CD

---

## 📚 **Referências**

### **Documentação Relacionada**
- [OpenSpec Workflow](../../docs/tutorial/04-ciclo-completo-openspec.md)
- [Template de Tasks](../../docs/templates/openspec-task-template.yaml)
- [Dashboard de Progresso](../../docs/dashboard/openspec-progress-dashboard.md)

### **Skills Relacionados**
- `openspec-validate-dependencies`
- `openspec-propose`
- `openspec-apply-change`
- `openspec-archive-change`

---

**Última atualização**: 2026-05-23  
**Status**: 🟡 Em desenvolvimento  
**Versão**: 1.0.0