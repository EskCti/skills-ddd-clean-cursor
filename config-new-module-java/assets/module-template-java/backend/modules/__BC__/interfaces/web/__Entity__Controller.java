package __GROUP__.modules.__BC__.interfaces.web;

import __GROUP__.__BC__.application.dto.Create__Entity__Input;
import __GROUP__.__BC__.application.dto.Create__Entity__Output;
import __GROUP__.__BC__.application.usecase.Create__Entity__UseCase;
import java.util.Map;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> create(@RequestBody Create__Entity__Input input) {
        var result = createUseCase.execute(input);
        if (result.isFailure()) {
            return ResponseEntity.badRequest().body(Map.of("errors", result.getErrorMessages()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(result.getOrNull());
    }
}