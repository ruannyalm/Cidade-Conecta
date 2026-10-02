package com.example.conecta.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TesteController {

    @GetMapping("/teste")
    public String teste(Authentication authentication) {
        return "Você está autenticado como: " + authentication.getName();
    }
}