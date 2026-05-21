using Xunit;

namespace Project.Shared.Kernel.Domain.Results.Tests;

public class ResultTests
{
    [Fact]
    public void Success_Result_ShouldBeSuccessful()
    {
        var result = Result.Success();
        
        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Empty(result.Errors);
    }
    
    [Fact]
    public void Failure_Result_WithSingleError_ShouldContainError()
    {
        var errorMessage = "Something went wrong";
        var result = Result.Failure(errorMessage);
        
        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Single(result.Errors);
        Assert.Equal(errorMessage, result.Errors[0]);
    }
    
    [Fact]
    public void Failure_Result_WithMultipleErrors_ShouldContainAllErrors()
    {
        var errors = new[] { "Error 1", "Error 2", "Error 3" };
        var result = Result.Failure(errors);
        
        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Equal(3, result.Errors.Count);
        Assert.Equal(errors, result.Errors);
    }
    
    [Fact]
    public void GenericResult_Success_ShouldContainValue()
    {
        var expectedValue = 42;
        var result = Result<int>.Success(expectedValue);
        
        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Equal(expectedValue, result.Value);
        Assert.Empty(result.Errors);
    }
    
    [Fact]
    public void GenericResult_Failure_ShouldThrowWhenAccessingValue()
    {
        var result = Result<string>.Failure("Invalid input");
        
        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Single(result.Errors);
        
        Assert.Throws<InvalidOperationException>(() => result.Value);
    }
    
    [Fact]
    public void Extension_ToResult_ShouldCreateSuccessfulResult()
    {
        var value = "test value";
        var result = value.ToResult();
        
        Assert.True(result.IsSuccess);
        Assert.Equal(value, result.Value);
    }
    
    [Fact]
    public void Extension_ToFailureResult_ShouldCreateFailedResult()
    {
        var error = "Validation error";
        var result = error.ToFailureResult<int>();
        
        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Single(result.Errors);
        Assert.Equal(error, result.Errors[0]);
    }
    
    [Fact]
    public void Bind_Extension_ShouldChainSuccessfulOperations()
    {
        var initialResult = Result.Success();
        
        var finalResult = initialResult
            .Bind(() => Result<int>.Success(10))
            .Bind(x => Result<string>.Success($"Value: {x}"));
        
        Assert.True(finalResult.IsSuccess);
        Assert.Equal("Value: 10", finalResult.Value);
    }
    
    [Fact]
    public void Bind_Extension_ShouldPropagateErrors()
    {
        var initialResult = Result.Failure("Initial error");
        
        var finalResult = initialResult
            .Bind(() => Result<int>.Success(10))
            .Bind(x => Result<string>.Success($"Value: {x}"));
        
        Assert.False(finalResult.IsSuccess);
        Assert.Single(finalResult.Errors);
        Assert.Equal("Initial error", finalResult.Errors[0]);
    }
    
    [Fact]
    public void OnSuccess_Extension_ShouldExecuteAction()
    {
        var executed = false;
        var result = Result<int>.Success(42);
        
        result.OnSuccess(value => executed = true);
        
        Assert.True(executed);
    }
    
    [Fact]
    public void OnSuccess_Extension_ShouldNotExecuteActionForFailure()
    {
        var executed = false;
        var result = Result<int>.Failure("Error");
        
        result.OnSuccess(value => executed = true);
        
        Assert.False(executed);
    }
    
    [Fact]
    public void OnFailure_Extension_ShouldExecuteAction()
    {
        var executed = false;
        var result = Result<int>.Failure("Error");
        
        result.OnFailure(errors => executed = true);
        
        Assert.True(executed);
    }
    
    [Fact]
    public void OnFailure_Extension_ShouldNotExecuteActionForSuccess()
    {
        var executed = false;
        var result = Result<int>.Success(42);
        
        result.OnFailure(errors => executed = true);
        
        Assert.False(executed);
    }
    
    [Fact]
    public void Result_WithEmptyErrorList_ShouldBeSuccessful()
    {
        var result = new Result(true, Array.Empty<string>());
        
        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Empty(result.Errors);
    }
    
    [Fact]
    public void GenericResult_WithEmptyErrorList_ShouldBeSuccessful()
    {
        var result = new Result<string>("test", true, Array.Empty<string>());
        
        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Equal("test", result.Value);
        Assert.Empty(result.Errors);
    }
}