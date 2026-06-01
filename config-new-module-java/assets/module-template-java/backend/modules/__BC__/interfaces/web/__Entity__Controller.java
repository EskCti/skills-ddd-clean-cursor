package __GROUP__.modules.__BC__.interfaces.web;

import __GROUP__.__BC__.application.dto.Create__Entity__Input;
import __GROUP__.__BC__.application.usecase.Create__Entity__UseCase;
import __GROUP__.__BC__.domain.entity.__Entity__;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/__entity__s")
public class __Entity__Controller {

    private final Create__Entity__UseCase createUseCase;

    public __Entity__Controller(Create__Entity__UseCase createUseCase) {
        this.createUseCase = createUseCase;
    }

    @PostMapping
    public ResponseEntity<__Entity__> create(@RequestBody Create__Entity__Input input) {
        var result = createUseCase.execute(input);
        if (result.isFailure()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(result.getOrNull());
    }
}
