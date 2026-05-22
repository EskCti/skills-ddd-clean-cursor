using ProjectName.Shared.Kernel.Domain.Results;
using Xunit;

namespace ProjectName.UnitTests.SharedKernel;

public class ResultTests
{
    [Fact]
    public void Success_ShouldBeSuccessful()
    {
        var result = Result.Success();
        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
    }

    [Fact]
    public void Failure_ShouldContainError()
    {
        var result = Result.Failure("invalid");
        Assert.False(result.IsSuccess);
        Assert.Contains("invalid", result.Errors);
    }
}
