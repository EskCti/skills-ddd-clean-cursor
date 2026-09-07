using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.Auth.Application.UseCases.Auth;
using Project.Auth.Domain.Services;
using System.Security.Claims;

namespace Project.Auth.Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly LoginUseCase _loginUseCase;
    private readonly RegisterUseCase _registerUseCase;
    private readonly ITokenProvider _tokenProvider;

    public AuthController(
        LoginUseCase loginUseCase,
        RegisterUseCase registerUseCase,
        ITokenProvider tokenProvider)
    {
        _loginUseCase = loginUseCase;
        _registerUseCase = registerUseCase;
        _tokenProvider = tokenProvider;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterInput input)
    {
        var result = await _registerUseCase.ExecuteAsync(input);
        if (!result.IsSuccess)
            return BadRequest(new { errors = result.Errors });

        return Created("", new { id = result.Value.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginInput input)
    {
        var result = await _loginUseCase.Execute(input);
        if (!result.IsSuccess)
            return Unauthorized(new { errors = result.Errors });

        return Ok(result.Value);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var isAdmin = User.IsInRole("Admin");

        return Ok(new { userId, email, isAdmin });
    }
}