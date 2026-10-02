package com.example.conecta.Controller;

import com.example.conecta.Dto.NotificacaoResponse;
import com.example.conecta.Service.NotificacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping
    public List<NotificacaoResponse> listar(Authentication authentication) {
        return notificacaoService.listar(authentication.getName());
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(Authentication authentication, @PathVariable Long id) {
        notificacaoService.marcarComoLida(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}