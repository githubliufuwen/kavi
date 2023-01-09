package com.github.kavi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;


@SpringBootApplication(scanBasePackages = {"com.github.kavi"})
public class KaviApplication {

    public static void main(String[] args) {
        SpringApplication.run(KaviApplication.class, args);
    }

}
