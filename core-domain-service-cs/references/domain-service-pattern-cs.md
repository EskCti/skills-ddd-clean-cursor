# Domain Service Pattern (C#)

## Escopo (fronteira)

- Considerar **serviço de domínio** apenas em caminhos `Project.Core/Domain/Services/`.
- Regra de negócio pura, sem dependência de I/O ou frameworks externos.

## Quando criar um Domain Service

- A lógica envolve múltiplas entidades e não pertence naturalmente a nenhuma delas.
- Cálculos complexos ou validações transversais de domínio.
- Precisa de uma operação que seja puramente stateless.

## Estrutura esperada

- Nome: `*Service`, `*Policy`, `*Calculator` (ex: `TaxCalculator`).
- Classe interna ao Domínio, sem dependências de infraestrutura.
- Pode ser injetado via interface se houver necessidade de mock em testes unitários.

## Exemplo em C#

```csharp
namespace Project.Core.Domain.Services;

public interface IStockCalculator
{
    int CalculateRemaining(int current, IEnumerable<int> movements);
}

public class StockCalculator : IStockCalculator
{
    public int CalculateRemaining(int current, IEnumerable<int> movements)
    {
        return current - movements.Sum();
    }
}
```

## Checklist de implementação

- [ ] Localizado em `Project.Core/Domain/Services/`.
- [ ] Não depende de Repositories (I/O).
- [ ] Lógica determinística e pura.
- [ ] Cobertura de testes unitários 100%.

## Armadilhas comuns

- Colocar lógica de orquestração (Use Case) aqui.
- Injetar um repositório e fazer I/O.
- Duplicar lógica que já está em uma Entidade.
