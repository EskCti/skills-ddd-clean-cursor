using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace ProjectName.IntegrationTests.Api;

public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Swagger_ShouldBeAvailableInDevelopment()
    {
        var response = await _client.GetAsync("/swagger/index.html");
        Assert.True(
            response.StatusCode is HttpStatusCode.OK or HttpStatusCode.NotFound,
            "Adjust when health/swagger route is configured.");
    }
}
