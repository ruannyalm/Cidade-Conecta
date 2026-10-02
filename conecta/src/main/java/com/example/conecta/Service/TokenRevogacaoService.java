package com.example.conecta.Service;

import com.example.conecta.Model.TokenRevogadoModel;
import com.example.conecta.Repository.TokenRevogadoRepository;
import com.example.conecta.Security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class TokenRevogacaoService {

    private final TokenRevogadoRepository tokenRevogadoRepository;
    private final JwtService jwtService;

    public TokenRevogacaoService(TokenRevogadoRepository tokenRevogadoRepository, JwtService jwtService) {
        this.tokenRevogadoRepository = tokenRevogadoRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public void revogar(String token) {
        if (!jwtService.validarToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido ou expirado.");
        }

        String tokenId = jwtService.extrairId(token);
        tokenRevogadoRepository.deleteByExpiraEmBefore(Instant.now());
        if (!tokenRevogadoRepository.existsById(tokenId)) {
            tokenRevogadoRepository.save(new TokenRevogadoModel(tokenId, jwtService.extrairExpiracao(token)));
        }
    }

    public boolean estaRevogado(String tokenId) {
        return tokenRevogadoRepository.existsById(tokenId);
    }
}