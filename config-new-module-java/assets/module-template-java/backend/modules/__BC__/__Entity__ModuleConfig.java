package __GROUP__.modules.__BC__;

import __GROUP__.__BC__.application.usecase.Create__Entity__UseCase;
import __GROUP__.__BC__.domain.repository.__Entity__Repository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class __Entity__ModuleConfig {

    @Bean
    public Create__Entity__UseCase create__Entity__UseCase(__Entity__Repository repository) {
        return new Create__Entity__UseCase(repository);
    }
}
