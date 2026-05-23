# Exemplo de Uso: Cache de Contexto OpenSpec

**Objetivo**: Demonstrar como skills podem utilizar o cache de contexto compartilhado para otimizar o ciclo OpenSpec.

---

## 🎯 **Cenário: EP-001 Auth (Stack C#)**

### **Contexto**
Estamos implementando o EP-001 Auth com as seguintes tasks:
1. `domain:vo` PasswordVO
2. `domain:entity` User entity
3. `app:usecase` LoginUseCase
4. `interface:controller` AuthController

**Problema**: Múltiplos skills precisam do mesmo `EmailVO` e `PasswordVO`, resultando em recálculos desnecessários.

**Solução**: Usar o cache de contexto para compartilhar Value Objects entre skills.

---

## 🔧 **Implementação Passo a Passo**

### **1. Configuração Inicial**

#### **Arquivo: `packages/shared-core/src/context/cache-keys.ts`**
```typescript
export const CACHE_KEYS = {
  // Value Objects compartilhados
  DOMAIN_VO: {
    EMAIL: 'domain:vo:email',
    PASSWORD: 'domain:vo:password',
    MONEY: 'domain:vo:money',
    PHONE: 'domain:vo:phone',
  },
  
  // Configurações do projeto
  PROJECT: {
    STACK: 'project:stack:csharp-vue-android',
    TENANT_STRATEGY: 'project:tenant-strategy:middleware',
    AUTH_PROVIDER: 'project:auth-provider:jwt',
  },
  
  // Entidades calculadas
  ENTITY: {
    USER: 'domain:entity:user',
    CUSTOMER: 'domain:entity:customer',
    PRODUCT: 'domain:entity:product',
  },
  
  // Gráficos de dependência
  CALCULATED: {
    DEPENDENCY_GRAPH: 'calculated:dependency-graph',
    TASK_ORDER: 'calculated:task-order',
  },
} as const;
```

### **2. Skill: `core-value-object-cs` (Modificado)**

#### **Arquivo: `.agents/skills/core-value-object-cs/src/index.ts`**
```typescript
import { ContextFactory, CACHE_KEYS } from '@retailops/shared-core/context';
import { Result } from '@retailops/shared-core/base';

export class PasswordVOSkill {
  async execute(params: {
    changeId: string;
    email: string;
    password: string;
  }): Promise<Result<any>> {
    const { changeId, email, password } = params;
    const context = ContextFactory.getManager(changeId);
    
    // 1. Verificar se EmailVO já está no cache
    let emailVo = context.get(CACHE_KEYS.DOMAIN_VO.EMAIL);
    
    if (!emailVo) {
      // Calcular EmailVO
      const emailResult = EmailVO.create(email);
      if (emailResult.isFailure()) {
        return Result.fail(emailResult.error);
      }
      
      emailVo = emailResult.value;
      // Armazenar no cache para reutilização
      context.set(CACHE_KEYS.DOMAIN_VO.EMAIL, emailVo);
      console.log(`📦 EmailVO calculado e armazenado no cache para ${changeId}`);
    } else {
      console.log(`✅ EmailVO reutilizado do cache para ${changeId}`);
    }
    
    // 2. Verificar se PasswordVO já está no cache
    let passwordVo = context.get(CACHE_KEYS.DOMAIN_VO.PASSWORD);
    
    if (!passwordVo) {
      // Calcular PasswordVO
      const passwordResult = PasswordVO.create(password);
      if (passwordResult.isFailure()) {
        return Result.fail(passwordResult.error);
      }
      
      passwordVo = passwordResult.value;
      // Armazenar no cache para reutilização
      context.set(CACHE_KEYS.DOMAIN_VO.PASSWORD, passwordVo);
      console.log(`📦 PasswordVO calculado e armazenado no cache para ${changeId}`);
    } else {
      console.log(`✅ PasswordVO reutilizado do cache para ${changeId}`);
    }
    
    return Result.ok({
      emailVo,
      passwordVo,
      cacheStats: context.getStats(),
    });
  }
}

// Implementações simplificadas dos VOs
class EmailVO {
  static create(email: string): Result<EmailVO> {
    // Validações de email
    if (!email.includes('@')) {
      return Result.fail('Email inválido');
    }
    
    return Result.ok(new EmailVO(email));
  }
  
  private constructor(public readonly value: string) {}
}

class PasswordVO {
  static create(password: string): Result<PasswordVO> {
    // Validações de senha
    if (password.length < 8) {
      return Result.fail('Senha deve ter pelo menos 8 caracteres');
    }
    
    // Hash bcrypt (simplificado para exemplo)
    const hashedPassword = `bcrypt:${password}`;
    
    return Result.ok(new PasswordVO(hashedPassword));
  }
  
  private constructor(public readonly value: string) {}
}
```

### **3. Skill: `core-entity-cs` (Modificado)**

#### **Arquivo: `.agents/skills/core-entity-cs/src/index.ts`**
```typescript
import { ContextFactory, CACHE_KEYS } from '@retailops/shared-core/context';
import { Result } from '@retailops/shared-core/base';

export class UserEntitySkill {
  async execute(params: {
    changeId: string;
    email: string;
    password: string;
    name: string;
  }): Promise<Result<any>> {
    const { changeId, email, password, name } = params;
    const context = ContextFactory.getManager(changeId);
    
    // 1. Tentar obter EmailVO do cache
    const emailVo = context.get(CACHE_KEYS.DOMAIN_VO.EMAIL);
    if (!emailVo) {
      return Result.fail('EmailVO não encontrado no cache. Execute core-value-object-cs primeiro.');
    }
    
    // 2. Tentar obter PasswordVO do cache
    const passwordVo = context.get(CACHE_KEYS.DOMAIN_VO.PASSWORD);
    if (!passwordVo) {
      return Result.fail('PasswordVO não encontrado no cache. Execute core-value-object-cs primeiro.');
    }
    
    // 3. Criar User entity usando VOs do cache
    const userResult = UserEntity.create({
      email: emailVo,
      password: passwordVo,
      name,
    });
    
    if (userResult.isFailure()) {
      return Result.fail(userResult.error);
    }
    
    const user = userResult.value;
    
    // 4. Armazenar User entity no cache para reutilização
    context.set(CACHE_KEYS.ENTITY.USER, user);
    console.log(`📦 UserEntity calculada e armazenada no cache para ${changeId}`);
    
    return Result.ok({
      user,
      cacheStats: context.getStats(),
    });
  }
}

class UserEntity {
  static create(params: {
    email: EmailVO;
    password: PasswordVO;
    name: string;
  }): Result<UserEntity> {
    const { email, password, name } = params;
    
    // Validações de domínio
    if (name.length < 2) {
      return Result.fail('Nome deve ter pelo menos 2 caracteres');
    }
    
    return Result.ok(new UserEntity(
      `user-${Date.now()}`,
      email,
      password,
      name
    ));
  }
  
  private constructor(
    public readonly id: string,
    public readonly email: EmailVO,
    public readonly password: PasswordVO,
    public readonly name: string
  ) {}
}
```

### **4. Skill: `core-use-case-cs` (Modificado)**

#### **Arquivo: `.agents/skills/core-use-case-cs/src/index.ts`**
```typescript
import { ContextFactory, CACHE_KEYS } from '@retailops/shared-core/context';
import { Result } from '@retailops/shared-core/base';

export class LoginUseCaseSkill {
  async execute(params: {
    changeId: string;
    email: string;
    password: string;
  }): Promise<Result<any>> {
    const { changeId, email, password } = params;
    const context = ContextFactory.getManager(changeId);
    
    // 1. Tentar obter User entity do cache
    const cachedUser = context.get(CACHE_KEYS.ENTITY.USER);
    
    if (cachedUser) {
      console.log(`✅ UserEntity reutilizada do cache para LoginUseCase`);
      
      // Simular validação de login
      const isValidLogin = this.validateLogin(cachedUser, email, password);
      
      return Result.ok({
        success: isValidLogin,
        user: cachedUser,
        token: isValidLogin ? `jwt-token-${Date.now()}` : null,
        cacheHit: true,
      });
    }
    
    // 2. Se User não estiver no cache, tentar obter VOs
    const emailVo = context.get(CACHE_KEYS.DOMAIN_VO.EMAIL);
    const passwordVo = context.get(CACHE_KEYS.DOMAIN_VO.PASSWORD);
    
    if (!emailVo || !passwordVo) {
      return Result.fail('VOs não encontrados no cache. Execute skills anteriores primeiro.');
    }
    
    // 3. Criar User e validar login
    const userResult = UserEntity.create({
      email: emailVo,
      password: passwordVo,
      name: 'Usuário Teste',
    });
    
    if (userResult.isFailure()) {
      return Result.fail(userResult.error);
    }
    
    const user = userResult.value;
    const isValidLogin = this.validateLogin(user, email, password);
    
    // 4. Armazenar no cache para futuros use cases
    context.set(CACHE_KEYS.ENTITY.USER, user);
    
    return Result.ok({
      success: isValidLogin,
      user,
      token: isValidLogin ? `jwt-token-${Date.now()}` : null,
      cacheHit: false,
    });
  }
  
  private validateLogin(user: UserEntity, email: string, password: string): boolean {
    // Lógica simplificada de validação
    return user.email.value === email;
  }
}
```

### **5. Skill: `backend-controller-cs` (Modificado)**

#### **Arquivo: `.agents/skills/backend-controller-cs/src/index.ts`**
```typescript
import { ContextFactory, CACHE_KEYS } from '@retailops/shared-core/context';
import { Result } from '@retailops/shared-core/base';

export class AuthControllerSkill {
  async execute(params: {
    changeId: string;
    request: {
      email: string;
      password: string;
    };
  }): Promise<Result<any>> {
    const { changeId, request } = params;
    const context = ContextFactory.getManager(changeId);
    
    console.log(`🔍 Verificando cache para ${changeId}...`);
    const stats = context.getStats();
    console.log(`📊 Estatísticas do cache:`, stats);
    
    // 1. Verificar se já temos User entity no cache
    const cachedUser = context.get(CACHE_KEYS.ENTITY.USER);
    
    if (cachedUser) {
      console.log(`🚀 Cache HIT! Reutilizando UserEntity para AuthController`);
      
      return Result.ok({
        statusCode: 200,
        body: {
          success: true,
          user: {
            id: cachedUser.id,
            email: cachedUser.email.value,
            name: cachedUser.name,
          },
          token: `jwt-token-from-cache-${Date.now()}`,
          cacheInfo: {
            hit: true,
            hits: stats.hits,
            misses: stats.misses,
            hitRate: (stats.hits / (stats.hits + stats.misses)) * 100,
          },
        },
      });
    }
    
    // 2. Se não tiver no cache, executar use case
    console.log(`❌ Cache MISS. Executando LoginUseCase...`);
    
    const loginUseCase = new LoginUseCaseSkill();
    const useCaseResult = await loginUseCase.execute({
      changeId,
      email: request.email,
      password: request.password,
    });
    
    if (useCaseResult.isFailure()) {
      return Result.fail(useCaseResult.error);
    }
    
    const useCaseData = useCaseResult.value;
    
    return Result.ok({
      statusCode: 200,
      body: {
        success: useCaseData.success,
        user: useCaseData.user ? {
          id: useCaseData.user.id,
          email: useCaseData.user.email.value,
          name: useCaseData.user.name,
        } : null,
        token: useCaseData.token,
        cacheInfo: {
          hit: false,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: (stats.hits / (stats.hits + stats.misses)) * 100,
        },
      },
    });
  }
}
```

---

## 🧪 **Teste de Integração**

### **Arquivo: `test/context-cache-integration.test.ts`**
```typescript
import { ContextFactory } from '@retailops/shared-core/context';
import { PasswordVOSkill } from '.agents/skills/core-value-object-cs';
import { UserEntitySkill } from '.agents/skills/core-entity-cs';
import { LoginUseCaseSkill } from '.agents/skills/core-use-case-cs';

describe('OpenSpec Context Cache Integration', () => {
  const changeId = 'ep-001-auth-test';
  
  beforeEach(() => {
    // Limpar cache antes de cada teste
    ContextFactory.releaseManager(changeId);
  });
  
  test('deve compartilhar VOs entre skills', async () => {
    // 1. Executar skill de Value Objects
    const voSkill = new PasswordVOSkill();
    const voResult = await voSkill.execute({
      changeId,
      email: 'test@example.com',
      password: 'senha123',
    });
    
    expect(voResult.isSuccess()).toBe(true);
    
    // 2. Executar skill de Entity (deve reutilizar VOs do cache)
    const entitySkill = new UserEntitySkill();
    const entityResult = await entitySkill.execute({
      changeId,
      email: 'test@example.com',
      password: 'senha123',
      name: 'Test User',
    });
    
    expect(entityResult.isSuccess()).toBe(true);
    
    // 3. Verificar estatísticas do cache
    const context = ContextFactory.getManager(changeId);
    const stats = context.getStats();
    
    console.log('Estatísticas finais do cache:', stats);
    
    // Esperamos hits porque o segundo skill reutilizou do cache
    expect(stats.hits).toBeGreaterThan(0);
    expect(stats.hitRate).toBeGreaterThan(0);
  });
  
  test('deve compartilhar Entity entre use cases', async () => {
    // 1. Executar todos os skills em sequência
    const voSkill = new PasswordVOSkill();
    await voSkill.execute({
      changeId,
      email: 'user@example.com',
      password: 'password123',
    });
    
    const entitySkill = new UserEntitySkill();
    await entitySkill.execute({
      changeId,
      email: 'user@example.com',
      password: 'password123',
      name: 'Integration User',
    });
    
    // 2. Executar use case (deve reutilizar Entity do cache)
    const useCaseSkill = new LoginUseCaseSkill();
    const useCaseResult = await useCaseSkill.execute({
      changeId,
      email: 'user@example.com',
      password: 'password123',
    });
    
    expect(useCaseResult.isSuccess()).toBe(true);
    
    // 3. Verificar que o use case detectou cache hit
    const useCaseData = useCaseResult.value;
    expect(useCaseData.cacheHit).toBe(true);
  });
});
```

---

## 📊 **Resultados Esperados**

### **Execução Sem Cache**
```
Skill 1: core-value-object-cs
  ✅ Calculando EmailVO... (5ms)
  ✅ Calculando PasswordVO... (8ms)
  
Skill 2: core-entity-cs  
  ❌ EmailVO não encontrado, recalculando... (5ms)
  ❌ PasswordVO não encontrado, recalculando... (8ms)
  ✅ Criando UserEntity... (3ms)
  
Skill 3: core-use-case-cs
  ❌ UserEntity não encontrada, recalculando...
  ❌ EmailVO não encontrado, recalculando...
  ❌ PasswordVO não encontrado, recalculando...
  ✅ Executando LoginUseCase... (10ms)
  
Total: ~39ms
Recálculos: 5 vezes
```

### **Execução Com Cache**
```
Skill 1: core-value-object-cs
  ✅ Calculando EmailVO... (5ms)
  ✅ Calculando PasswordVO... (8ms)
  📦 Armazenando no cache...
  
Skill 2: core-entity-cs
  ✅ EmailVO obtido do cache! (0.1ms)
  ✅ PasswordVO obtido do cache! (0.1ms)
  ✅ Criando UserEntity... (3ms)
  📦 Armazenando no cache...
  
Skill 3: core-use-case-cs
  ✅ UserEntity obtida do cache! (0.1ms)
  ✅ Executando LoginUseCase... (10ms)
  
Total: ~26.3ms
Recálculos: 1 vez
Economia: ~12.7ms (32.6%)
```

### **Estatísticas do Cache**
```json
{
  "hits": 3,
  "misses": 1,
  "hitRate": 75.0,
  "size": 3,
  "memoryUsage": 3072
}
```

---

## 🔄 **Workflow Otimizado**

### **Antes (Sequencial)**
```
openspec-apply-change ep-001-auth
  ↓
Task 1: core-value-object-cs (calcula VOs)
  ↓
Task 2: core-entity-cs (recalcula VOs, cria entity)
  ↓  
Task 3: core-use-case-cs (recalcula tudo)
```

### **Depois (Com Cache)**
```
openspec-apply-change ep-001-auth
  ↓
Task 1: core-value-object-cs (calcula VOs, armazena no cache)
  ↓
Task 2: core-entity-cs (reutiliza VOs do cache, cria entity, armazena no cache)
  ↓
Task 3: core-use-case-cs (reutiliza entity do cache)
```

---

## 🚀 **Próximos Passos**

### **1. Implementação nos Skills Principais**
- [ ] `core-value-object-cs` - ✅ Concluído
- [ ] `core-entity-cs` - ✅ Concluído  
- [ ] `core-use-case-cs` - ✅ Concluído
- [ ] `backend-controller-cs` - ✅ Concluído
- [ ] `frontend-entity-vue`
- [ ] `mobile-entity-android`

### **2. Melhorias no Cache**
- [ ] Persistência em arquivo
- [ ] Compressão de dados
- [ ] Cache distribuído (Redis)
- [ ] Invalidação baseada em tempo

### **3. Monitoramento**
- [ ] Dashboard de métricas
- [ ] Alertas de performance
- [ ] Logs detalhados

---

## 📚 **Referências**

### **Documentação**
- [OpenSpec Context Cache SKILL](../../openspec-context-cache/SKILL.md)
- [Tutorial OpenSpec](../../tutorial/04-ciclo-completo-openspec.md)
- [Dashboard de Progresso](../../dashboard/openspec-progress-dashboard.md)

### **Código Fonte**
- `packages/shared-core/src/context/` - Implementação do cache
- `.agents/skills/core-*-cs/` - Skills modificados
- `test/context-cache-integration.test.ts` - Testes de integração

---

**Última atualização**: 2026-05-23  
**Status**: ✅ Exemplo funcional  
**Stack**: C# + Vue + Android