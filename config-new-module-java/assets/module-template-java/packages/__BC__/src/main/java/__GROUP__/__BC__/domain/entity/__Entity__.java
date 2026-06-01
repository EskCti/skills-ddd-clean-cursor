package __GROUP__.__BC__.domain.entity;

import __GROUP__.shared.DomainError;
import __GROUP__.shared.Entity;
import __GROUP__.shared.Result;
import java.util.UUID;

public class __Entity__ implements Entity<UUID> {
    private final UUID id;

    private __Entity__(UUID id) {
        this.id = id;
    }

    @Override
    public UUID id() {
        return id;
    }

    public static Result<__Entity__> create(UUID id) {
        if (id == null) {
            return Result.err(DomainError.of("id is required"));
        }
        return Result.ok(new __Entity__(id));
    }
}
