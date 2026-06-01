package __GROUP__.modules.__BC__.infrastructure.persistence;

import __GROUP__.__BC__.domain.entity.__Entity__;
import __GROUP__.__BC__.domain.repository.__Entity__Repository;
import __GROUP__.shared.Result;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class __Entity__RepositoryAdapter implements __Entity__Repository {

    private final __Entity__JpaRepository jpaRepository;

    public __Entity__RepositoryAdapter(__Entity__JpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Result<__Entity__> save(__Entity__ entity) {
        // implement via backend-data-java
        throw new UnsupportedOperationException("implement via backend-data-java");
    }

    @Override
    public Result<Optional<__Entity__>> findById(UUID id) {
        // implement via backend-data-java
        throw new UnsupportedOperationException("implement via backend-data-java");
    }
}
