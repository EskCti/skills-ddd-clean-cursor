package __GROUP__.shared;

public record DomainError(String code, String message) {
    public static DomainError of(String message) {
        return new DomainError("DOMAIN_ERROR", message);
    }
}
