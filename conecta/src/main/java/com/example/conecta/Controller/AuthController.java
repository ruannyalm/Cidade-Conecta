package com.example.conecta.Controller;

import com.example.conecta.Dto.CadastroRequest;
import com.example.conecta.Dto.LoginRequest;
import com.example.conecta.Dto.LoginResponse;
import com.example.conecta.Service.AuthService;
import com.example.conecta.Service.TokenRevogacaoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final TokenRevogacaoService tokenRevogacaoService;

    public AuthController(AuthService authService, TokenRevogacaoService tokenRevogacaoService) {
        this.authService = authService;
        this.tokenRevogacaoService = tokenRevogacaoService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Map<String, String>> cadastrar(@RequestBody CadastroRequest request) {
        authService.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensagem", "Cadastro realizado com sucesso."));
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@org.springframework.web.bind.annotation.RequestHeader(HttpHeaders.AUTHORIZATION)
            String authorizationHeader, Authentication authentication) {
        tokenRevogacaoService.revogar(authorizationHeader.substring(7));
        return ResponseEntity.noContent().build();
    }
}