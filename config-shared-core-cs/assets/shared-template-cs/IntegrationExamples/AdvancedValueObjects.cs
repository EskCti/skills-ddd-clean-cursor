using Project.Shared.Kernel.Domain.Base;
using Project.Shared.Kernel.Domain.Results;
using System.Text.RegularExpressions;

namespace Project.Shared.Kernel.Domain.ValueObjects.Advanced;

// ============================================
// 1. Value Object com validações complexas
// ============================================

public record Email : ValueObject
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Result<Email> Create(string value)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(value))
            errors.Add("Email cannot be empty");

        if (value.Length > 254)
            errors.Add("Email cannot exceed 254 characters");

        // Validação de formato básico
        if (!Regex.IsMatch(value, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            errors.Add("Invalid email format");

        // Validação de domínio (exemplo simplificado)
        var domain = value.Split('@').Last();
        if (domain.Split('.').Length < 2)
            errors.Add("Email domain must have at least two parts");

        // Validação de caracteres especiais
        if (value.Contains("..") || value.Contains(".@") || value.Contains("@."))
            errors.Add("Email contains invalid character sequences");

        if (errors.Any())
            return Result<Email>.Failure(errors);

        return Result<Email>.Success(new Email(value.ToLowerInvariant().Trim()));
    }

    public string GetDomain() => Value.Split('@').Last();
    public string GetUsername() => Value.Split('@').First();

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}

// ============================================
// 2. Value Object com formatação e parsing
// ============================================

public record PhoneNumber : ValueObject
{
    public string CountryCode { get; }
    public string AreaCode { get; }
    public string Number { get; }

    private PhoneNumber(string countryCode, string areaCode, string number)
    {
        CountryCode = countryCode;
        AreaCode = areaCode;
        Number = number;
    }

    public static Result<PhoneNumber> Create(string phoneNumber)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(phoneNumber))
            errors.Add("Phone number cannot be empty");

        // Remover caracteres não numéricos
        var digitsOnly = new string(phoneNumber.Where(char.IsDigit).ToArray());

        if (digitsOnly.Length < 10)
            errors.Add("Phone number must have at least 10 digits");

        if (digitsOnly.Length > 15)
            errors.Add("Phone number cannot exceed 15 digits");

        if (errors.Any())
            return Result<PhoneNumber>.Failure(errors);

        // Parse baseado no comprimento (exemplo simplificado)
        string countryCode, areaCode, number;

        if (digitsOnly.Length == 10)
        {
            countryCode = "1"; // EUA/Canadá padrão
            areaCode = digitsOnly[..3];
            number = digitsOnly[3..];
        }
        else if (digitsOnly.Length == 11 && digitsOnly.StartsWith("1"))
        {
            countryCode = "1";
            areaCode = digitsOnly[1..4];
            number = digitsOnly[4..];
        }
        else
        {
            // Para números internacionais, assumir primeiros 1-3 dígitos como código do país
            countryCode = digitsOnly[..Math.Min(3, digitsOnly.Length - 7)];
            areaCode = digitsOnly[countryCode.Length..(countryCode.Length + 3)];
            number = digitsOnly[(countryCode.Length + 3)..];
        }

        return Result<PhoneNumber>.Success(new PhoneNumber(countryCode, areaCode, number));
    }

    public string ToInternationalFormat() => $"+{CountryCode} ({AreaCode}) {Number[..3]}-{Number[3..]}";
    public string ToNationalFormat() => $"({AreaCode}) {Number[..3]}-{Number[3..]}";
    public string ToE164Format() => $"+{CountryCode}{AreaCode}{Number}";

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return CountryCode;
        yield return AreaCode;
        yield return Number;
    }
}

// ============================================
// 3. Value Object com operações matemáticas
// ============================================

public record Percentage : ValueObject
{
    public decimal Value { get; }

    private Percentage(decimal value) => Value = value;

    public static Result<Percentage> Create(decimal value)
    {
        var errors = new List<string>();

        if (value < 0)
            errors.Add("Percentage cannot be negative");

        if (value > 100)
            errors.Add("Percentage cannot exceed 100");

        if (errors.Any())
            return Result<Percentage>.Failure(errors);

        return Result<Percentage>.Success(new Percentage(Math.Round(value, 2)));
    }

    public static Result<Percentage> CreateFromFraction(decimal fraction)
    {
        return Create(fraction * 100);
    }

    public decimal ToFraction() => Value / 100;

    public Percentage Add(Percentage other)
    {
        var result = Value + other.Value;
        return new Percentage(Math.Min(result, 100));
    }

    public Percentage Subtract(Percentage other)
    {
        var result = Value - other.Value;
        return new Percentage(Math.Max(result, 0));
    }

    public decimal ApplyTo(decimal amount) => amount * ToFraction();

    public override string ToString() => $"{Value}%";

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}

// ============================================
// 4. Value Object com validações de negócio
// ============================================

public record TaxId : ValueObject
{
    public string Value { get; }

    private TaxId(string value) => Value = value;

    public static Result<TaxId> Create(string value, string countryCode = "US")
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(value))
            errors.Add("Tax ID cannot be empty");

        // Remover caracteres não alfanuméricos
        var cleanValue = new string(value.Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray());

        // Validações específicas por país
        switch (countryCode.ToUpperInvariant())
        {
            case "US":
                if (!IsValidSsn(cleanValue) && !IsValidEin(cleanValue))
                    errors.Add("Invalid US Tax ID (SSN or EIN)");
                break;

            case "BR":
                if (!IsValidCpf(cleanValue) && !IsValidCnpj(cleanValue))
                    errors.Add("Invalid Brazilian Tax ID (CPF or CNPJ)");
                break;

            default:
                // Validação genérica para outros países
                if (cleanValue.Length < 5 || cleanValue.Length > 20)
                    errors.Add($"Tax ID must be between 5 and 20 characters for country {countryCode}");
                break;
        }

        if (errors.Any())
            return Result<TaxId>.Failure(errors);

        return Result<TaxId>.Success(new TaxId(cleanValue.ToUpperInvariant()));
    }

    private static bool IsValidSsn(string value)
    {
        // Validação simplificada de SSN (Social Security Number)
        if (value.Length != 9) return false;
        if (!long.TryParse(value, out _)) return false;
        
        // Não permitir números conhecidos como inválidos
        var invalidPrefixes = new[] { "000", "666", "900-999" };
        var prefix = value[..3];
        
        return !invalidPrefixes.Any(p => prefix == p || 
            (p.Contains('-') && int.TryParse(prefix, out var num) && 
             num >= 900 && num <= 999));
    }

    private static bool IsValidEin(string value)
    {
        // Validação simplificada de EIN (Employer Identification Number)
        if (value.Length != 9) return false;
        if (!long.TryParse(value, out _)) return false;
        
        // EIN começa com prefixos específicos
        var prefix = value[..2];
        var validPrefixes = new[] { "01", "02", "03", "04", "05", "06", "10", "11", "12", "13", "14", "15", "16", "20", "21", "22", "23", "24", "25", "26", "27", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "71", "72", "73", "74", "75", "76", "77", "80", "81", "82", "83", "84", "85", "86", "87", "88", "90", "91", "92", "93", "94", "95", "98", "99" };
        
        return validPrefixes.Contains(prefix);
    }

    private static bool IsValidCpf(string value)
    {
        // Validação simplificada de CPF brasileiro
        if (value.Length != 11) return false;
        if (!long.TryParse(value, out _)) return false;
        
        // Todos dígitos iguais são inválidos
        if (value.Distinct().Count() == 1) return false;
        
        // Algoritmo de validação do CPF (simplificado)
        return true;
    }

    private static bool IsValidCnpj(string value)
    {
        // Validação simplificada de CNPJ brasileiro
        if (value.Length != 14) return false;
        if (!long.TryParse(value, out _)) return false;
        
        // Algoritmo de validação do CNPJ (simplificado)
        return true;
    }

    public string GetFormatted()
    {
        if (Value.Length == 9) // SSN/EIN
            return $"{Value[..3]}-{Value[3..5]}-{Value[5..]}";
        
        if (Value.Length == 11) // CPF
            return $"{Value[..3]}.{Value[3..6]}.{Value[6..9]}-{Value[9..]}";
        
        if (Value.Length == 14) // CNPJ
            return $"{Value[..2]}.{Value[2..5]}.{Value[5..8]}/{Value[8..12]}-{Value[12..]}";
        
        return Value;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}

// ============================================
// 5. Value Object com validações de segurança
// ============================================

public record Password : ValueObject
{
    public string Hash { get; }

    private Password(string hash) => Hash = hash;

    public static Result<Password> Create(string plainTextPassword)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(plainTextPassword))
            errors.Add("Password cannot be empty");

        if (plainTextPassword.Length < 8)
            errors.Add("Password must be at least 8 characters long");

        if (plainTextPassword.Length > 128)
            errors.Add("Password cannot exceed 128 characters");

        // Verificar complexidade
        if (!Regex.IsMatch(plainTextPassword, @"[A-Z]"))
            errors.Add("Password must contain at least one uppercase letter");

        if (!Regex.IsMatch(plainTextPassword, @"[a-z]"))
            errors.Add("Password must contain at least one lowercase letter");

        if (!Regex.IsMatch(plainTextPassword, @"[0-9]"))
            errors.Add("Password must contain at least one digit");

        if (!Regex.IsMatch(plainTextPassword, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
            errors.Add("Password must contain at least one special character");

        // Verificar senhas comuns (lista simplificada)
        var commonPasswords = new[] { "password", "12345678", "qwerty123", "admin123" };
        if (commonPasswords.Contains(plainTextPassword.ToLowerInvariant()))
            errors.Add("Password is too common, choose a stronger one");

        if (errors.Any())
            return Result<Password>.Failure(errors);

        // Gerar hash seguro (em produção, use bcrypt ou Argon2)
        var hash = BCrypt.Net.BCrypt.HashPassword(plainTextPassword);
        return Result<Password>.Success(new Password(hash));
    }

    public bool Verify(string plainTextPassword)
    {
        return BCrypt.Net.BCrypt.Verify(plainTextPassword, Hash);
    }

    public bool NeedsRehash()
    {
        // Verificar se o hash precisa ser atualizado (ex: work factor aumentou)
        return BCrypt.Net.BCrypt.PasswordNeedsRehash(Hash, 12);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Hash;
    }
}