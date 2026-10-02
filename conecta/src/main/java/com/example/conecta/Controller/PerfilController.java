package com.example.conecta.Controller;

import com.example.conecta.Dto.AlterarSenhaRequest;
import com.example.conecta.Dto.AtualizarPerfilRequest;
import com.example.conecta.Dto.LoginResponse;
import com.example.conecta.Dto.PerfilResponse;
import com.example.conecta.Service.PerfilService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios/perfil")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public PerfilResponse obterPerfil(Authentication authentication) {
        return perfilService.obterPerfil(authentication.getName());
    }

    @PutMapping
    public LoginResponse atualizarPerfil(Authentication authentication, @RequestBody AtualizarPerfilRequest request) {
        return perfilService.atualizarPerfil(authentication.getName(), request);
    }

    @PatchMapping("/senha")
    public void alterarSenha(Authentication authentication, @RequestBody AlterarSenhaRequest request) {
        perfilService.alterarSenha(authentication.getName(), request);
    }
}