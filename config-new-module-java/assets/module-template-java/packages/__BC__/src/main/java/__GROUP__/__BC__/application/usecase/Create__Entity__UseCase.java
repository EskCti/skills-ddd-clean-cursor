package __GROUP__.__BC__.application.usecase;

import __GROUP__.__BC__.application.dto.Create__Entity__Input;
import __GROUP__.__BC__.application.dto.Create__Entity__Output;
import __GROUP__.__BC__.domain.repository.__Entity__Repository;
import __GROUP__.shared.Result;
import __GROUP__.shared.UseCase;

public class Create__Entity__UseCase implements UseCase<Create__Entity__Input, Create__Entity__Output> {

    private final __Entity__Repository repository;

    public Create__Entity__UseCase(__Entity__Repository repository) {
        this.repository = repository;
    }

    @Override
    public Result<Create__Entity__Output> execute(Create__Entity__Input input) {
        // implement via core-use-case-java
        throw new UnsupportedOperationException("implement via core-use-case-java");
    }
}
