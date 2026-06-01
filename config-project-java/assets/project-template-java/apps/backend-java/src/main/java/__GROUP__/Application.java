package __GROUP__;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "__GROUP__")
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
