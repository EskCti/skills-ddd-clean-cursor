namespace Project.Shared.Kernel.Domain.Results.Examples;

public class ResultUsageExample
{
    public void DemonstrateBasicUsage()
    {
        // Resultado de sucesso sem valor
        var successResult = Result.Success();
        Console.WriteLine($"Success: {successResult.IsSuccess}, Errors: {successResult.Errors.Count}");
        
        // Resultado de falha com um erro
        var singleErrorResult = Result.Failure("Validation failed");
        Console.WriteLine($"Success: {singleErrorResult.IsSuccess}, Errors: {string.Join(", ", singleErrorResult.Errors)}");
        
        // Resultado de falha com múltiplos erros
        var multipleErrorsResult = Result.Failure(new[] { "Name is required", "Email is invalid", "Age must be positive" });
        Console.WriteLine($"Success: {multipleErrorsResult.IsSuccess}, Errors: {string.Join("; ", multipleErrorsResult.Errors)}");
    }
    
    public void DemonstrateGenericResult()
    {
        // Resultado de sucesso com valor
        var successWithValue = Result<int>.Success(42);
        Console.WriteLine($"Success: {successWithValue.IsSuccess}, Value: {successWithValue.Value}");
        
        // Resultado de falha com valor genérico
        var failureWithValue = Result<string>.Failure("Invalid input");
        Console.WriteLine($"Success: {failureWithValue.IsSuccess}, Has errors: {failureWithValue.Errors.Any()}");
        
        // Acessar valor de falha lança exceção
        try
        {
            var value = failureWithValue.Value;
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"Expected exception: {ex.Message}");
        }
    }
    
    public void DemonstrateExtensions()
    {
        // Usando extensões
        var result = 42.ToResult();
        Console.WriteLine($"Value from extension: {result.Value}");
        
        // Encadeamento de operações
        var chainedResult = Result.Success()
            .Bind(() => Result<int>.Success(10))
            .Bind(x => Result<string>.Success($"Value is {x}"))
            .OnSuccess(value => Console.WriteLine($"Final value: {value}"))
            .OnFailure(errors => Console.WriteLine($"Errors: {string.Join(", ", errors)}"));
    }
    
    public void DemonstrateValidationScenario()
    {
        var validationErrors = new List<string>();
        
        // Simulando validações
        if (string.IsNullOrEmpty(""))
            validationErrors.Add("Name is required");
        
        if (!"invalid-email".Contains("@"))
            validationErrors.Add("Email is invalid");
        
        if (-5 > 0)
            validationErrors.Add("Age must be positive");
        
        if (validationErrors.Any())
        {
            var validationResult = Result.Failure(validationErrors);
            Console.WriteLine($"Validation failed with {validationResult.Errors.Count} errors:");
            foreach (var error in validationResult.Errors)
            {
                Console.WriteLine($"  - {error}");
            }
        }
        else
        {
            Console.WriteLine("Validation passed");
        }
    }
}