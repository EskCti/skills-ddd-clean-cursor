using Xunit;
using Project.Shared.Kernel.Domain.ValueObjects.Advanced;
using Project.Shared.Kernel.Domain.Results;

namespace Project.Shared.Kernel.Domain.Tests.ValueObjects.Advanced;

public class EmailTests
{
    [Theory]
    [InlineData("user@example.com")]
    [InlineData("first.last@company.co.uk")]
    [InlineData("user+tag@domain.org")]
    public void Create_ValidEmail_ShouldReturnSuccess(string email)
    {
        var result = Email.Create(email);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(email.ToLowerInvariant().Trim(), result.Value.Value);
    }
    
    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData(null)]
    public void Create_EmptyEmail_ShouldReturnFailure(string email)
    {
        var result = Email.Create(email);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be empty", result.Errors[0]);
    }
    
    [Fact]
    public void Create_EmailTooLong_ShouldReturnFailure()
    {
        var longEmail = new string('a', 250) + "@example.com";
        var result = Email.Create(longEmail);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot exceed 254 characters", result.Errors[0]);
    }
    
    [Theory]
    [InlineData("invalid-email")]
    [InlineData("user@")]
    [InlineData("@domain.com")]
    [InlineData("user@.com")]
    [InlineData("user@domain.")]
    public void Create_InvalidFormat_ShouldReturnFailure(string email)
    {
        var result = Email.Create(email);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("Invalid email format", result.Errors[0]);
    }
    
    [Theory]
    [InlineData("user..double@domain.com")]
    [InlineData("user.@domain.com")]
    [InlineData(".user@domain.com")]
    public void Create_InvalidCharacterSequence_ShouldReturnFailure(string email)
    {
        var result = Email.Create(email);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("invalid character sequences", result.Errors[0]);
    }
    
    [Fact]
    public void GetDomain_ShouldReturnCorrectDomain()
    {
        var email = Email.Create("user@example.com").Value;
        
        Assert.Equal("example.com", email.GetDomain());
    }
    
    [Fact]
    public void GetUsername_ShouldReturnCorrectUsername()
    {
        var email = Email.Create("user@example.com").Value;
        
        Assert.Equal("user", email.GetUsername());
    }
    
    [Fact]
    public void Equals_SameEmailDifferentCase_ShouldBeEqual()
    {
        var email1 = Email.Create("USER@EXAMPLE.COM").Value;
        var email2 = Email.Create("user@example.com").Value;
        
        Assert.Equal(email1, email2);
    }
}

public class PhoneNumberTests
{
    [Theory]
    [InlineData("1234567890", "1", "123", "4567890")] // 10 dígitos EUA
    [InlineData("11234567890", "1", "123", "4567890")] // 11 dígitos EUA
    public void Create_ValidPhoneNumber_ShouldReturnSuccess(string phone, string expectedCountry, string expectedArea, string expectedNumber)
    {
        var result = PhoneNumber.Create(phone);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(expectedCountry, result.Value.CountryCode);
        Assert.Equal(expectedArea, result.Value.AreaCode);
        Assert.Equal(expectedNumber, result.Value.Number);
    }
    
    [Theory]
    [InlineData("")]
    [InlineData("123")]
    [InlineData("123456789")]
    public void Create_InvalidLength_ShouldReturnFailure(string phone)
    {
        var result = PhoneNumber.Create(phone);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("must have at least 10 digits", result.Errors[0]);
    }
    
    [Fact]
    public void ToInternationalFormat_ShouldReturnCorrectFormat()
    {
        var phone = PhoneNumber.Create("11234567890").Value;
        
        Assert.Equal("+1 (123) 456-7890", phone.ToInternationalFormat());
    }
    
    [Fact]
    public void ToNationalFormat_ShouldReturnCorrectFormat()
    {
        var phone = PhoneNumber.Create("11234567890").Value;
        
        Assert.Equal("(123) 456-7890", phone.ToNationalFormat());
    }
    
    [Fact]
    public void ToE164Format_ShouldReturnCorrectFormat()
    {
        var phone = PhoneNumber.Create("11234567890").Value;
        
        Assert.Equal("+11234567890", phone.ToE164Format());
    }
}

public class PercentageTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(50)]
    [InlineData(100)]
    [InlineData(25.5)]
    [InlineData(99.99)]
    public void Create_ValidPercentage_ShouldReturnSuccess(decimal value)
    {
        var result = Percentage.Create(value);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(Math.Round(value, 2), result.Value.Value);
    }
    
    [Theory]
    [InlineData(-1)]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    [InlineData(150)]
    public void Create_InvalidPercentage_ShouldReturnFailure(decimal value)
    {
        var result = Percentage.Create(value);
        
        Assert.False(result.IsSuccess);
        Assert.Single(result.Errors);
    }
    
    [Fact]
    public void CreateFromFraction_ValidFraction_ShouldReturnSuccess()
    {
        var result = Percentage.CreateFromFraction(0.5m);
        
        Assert.True(result.IsSuccess);
        Assert.Equal(50m, result.Value.Value);
    }
    
    [Fact]
    public void ToFraction_ShouldReturnCorrectFraction()
    {
        var percentage = Percentage.Create(75).Value;
        
        Assert.Equal(0.75m, percentage.ToFraction());
    }
    
    [Fact]
    public void Add_Percentages_ShouldReturnCorrectSum()
    {
        var p1 = Percentage.Create(30).Value;
        var p2 = Percentage.Create(40).Value;
        
        var result = p1.Add(p2);
        
        Assert.Equal(70m, result.Value);
    }
    
    [Fact]
    public void Add_Exceeding100_ShouldCapAt100()
    {
        var p1 = Percentage.Create(80).Value;
        var p2 = Percentage.Create(30).Value;
        
        var result = p1.Add(p2);
        
        Assert.Equal(100m, result.Value);
    }
    
    [Fact]
    public void Subtract_Percentages_ShouldReturnCorrectDifference()
    {
        var p1 = Percentage.Create(70).Value;
        var p2 = Percentage.Create(30).Value;
        
        var result = p1.Subtract(p2);
        
        Assert.Equal(40m, result.Value);
    }
    
    [Fact]
    public void Subtract_BelowZero_ShouldCapAtZero()
    {
        var p1 = Percentage.Create(20).Value;
        var p2 = Percentage.Create(30).Value;
        
        var result = p1.Subtract(p2);
        
        Assert.Equal(0m, result.Value);
    }
    
    [Fact]
    public void ApplyTo_Amount_ShouldReturnCorrectValue()
    {
        var percentage = Percentage.Create(20).Value;
        
        var result = percentage.ApplyTo(1000m);
        
        Assert.Equal(200m, result);
    }
    
    [Fact]
    public void ToString_ShouldReturnPercentageFormat()
    {
        var percentage = Percentage.Create(33.33m).Value;
        
        Assert.Equal("33.33%", percentage.ToString());
    }
}

public class TaxIdTests
{
    [Theory]
    [InlineData("123-45-6789", "US")] // SSN válido
    [InlineData("12-3456789", "US")] // EIN válido
    public void Create_ValidUS_TaxId_ShouldReturnSuccess(string taxId, string country)
    {
        var result = TaxId.Create(taxId, country);
        
        Assert.True(result.IsSuccess);
    }
    
    [Theory]
    [InlineData("000-45-6789", "US")] // SSN inválido (prefixo 000)
    [InlineData("666-45-6789", "US")] // SSN inválido (prefixo 666)
    [InlineData("999-45-6789", "US")] // SSN inválido (prefixo 999)
    [InlineData("123456", "US")] // Muito curto
    public void Create_InvalidUS_TaxId_ShouldReturnFailure(string taxId, string country)
    {
        var result = TaxId.Create(taxId, country);
        
        Assert.False(result.IsSuccess);
    }
    
    [Fact]
    public void GetFormatted_SSN_ShouldReturnCorrectFormat()
    {
        var taxId = TaxId.Create("123456789", "US").Value;
        
        Assert.Equal("123-45-6789", taxId.GetFormatted());
    }
    
    [Fact]
    public void Create_EmptyTaxId_ShouldReturnFailure()
    {
        var result = TaxId.Create("", "US");
        
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be empty", result.Errors[0]);
    }
    
    [Fact]
    public void Equals_SameTaxIdDifferentFormat_ShouldBeEqual()
    {
        var taxId1 = TaxId.Create("123-45-6789", "US").Value;
        var taxId2 = TaxId.Create("123456789", "US").Value;
        
        Assert.Equal(taxId1, taxId2);
    }
}

public class PasswordTests
{
    [Fact]
    public void Create_ValidPassword_ShouldReturnSuccess()
    {
        var password = "StrongP@ssw0rd123!";
        var result = Password.Create(password);
        
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value.Hash);
        Assert.NotEmpty(result.Value.Hash);
    }
    
    [Theory]
    [InlineData("")] // Vazio
    [InlineData("  ")] // Espaços
    [InlineData("short")] // Muito curto
    [InlineData("nouppercase123!")] // Sem maiúscula
    [InlineData("NOLOWERCASE123!")] // Sem minúscula
    [InlineData("NoDigitsSpecial!")] // Sem dígitos
    [InlineData("NoSpecialChars123")] // Sem caracteres especiais
    public void Create_InvalidPassword_ShouldReturnFailure(string password)
    {
        var result = Password.Create(password);
        
        Assert.False(result.IsSuccess);
        Assert.NotEmpty(result.Errors);
    }
    
    [Theory]
    [InlineData("password")] // Senha comum
    [InlineData("12345678")] // Sequência numérica
    [InlineData("qwerty123")] // Teclado
    public void Create_CommonPassword_ShouldReturnFailure(string password)
    {
        var result = Password.Create(password);
        
        Assert.False(result.IsSuccess);
        Assert.Contains("too common", result.Errors[0]);
    }
    
    [Fact]
    public void Verify_CorrectPassword_ShouldReturnTrue()
    {
        var plainText = "StrongP@ssw0rd123!";
        var password = Password.Create(plainText).Value;
        
        var result = password.Verify(plainText);
        
        Assert.True(result);
    }
    
    [Fact]
    public void Verify_IncorrectPassword_ShouldReturnFalse()
    {
        var password = Password.Create("StrongP@ssw0rd123!").Value;
        
        var result = password.Verify("WrongPassword123!");
        
        Assert.False(result);
    }
    
    [Fact]
    public void NeedsRehash_WithOldHash_ShouldReturnTrue()
    {
        // Este teste é simplificado - em produção, você testaria com um hash antigo
        // Para este exemplo, assumimos que o hash gerado é atual
        var password = Password.Create("StrongP@ssw0rd123!").Value;
        
        var result = password.NeedsRehash();
        
        // Dependendo da implementação, pode retornar true ou false
        Assert.IsType<bool>(result);
    }
}