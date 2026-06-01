package __GROUP__.__BC__.domain.repository;

import __GROUP__.__BC__.domain.entity.__Entity__;
import __GROUP__.shared.Result;
import java.util.Optional;
import java.util.UUID;

public interface __Entity__Repository {
    Result<__Entity__> save(__Entity__ entity);
    Result<Optional<__Entity__>> findById(UUID id);
}
