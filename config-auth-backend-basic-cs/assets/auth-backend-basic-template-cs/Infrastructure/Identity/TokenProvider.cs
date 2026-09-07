using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Project.Auth.Domain.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Project.Auth.Infrastructure.Identity;

public class JwtTokenProvider : ITokenProvider
{
    private readonly IConfiguration _configuration;

    public JwtTokenProvider(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Generate(Guid userId, string email, bool isAdmin)
    {
        var secret = _configuration.GetValue<string>("Jwt:Secret")
            ?? throw new InvalidOperationException("Jwt:Secret not configured.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var now = DateTime.UtcNow;
        var claims = new List<Claim>();
        claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
        claims.Add(new Claim(ClaimTypes.Email, email));
        if (isAdmin)
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));

        var token = new JwtSecurityToken(
            _configuration.GetValue<string>("Jwt:Issuer") ?? "app",
            _configuration.GetValue<string>("Jwt:Audience") ?? "app",
            claims,
            now,
            now.AddHours(8),
            credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}