package com.example.conecta.Security;

import com.example.conecta.Model.Role;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private static final long TOKEN_VALIDITY_MILLIS = 24 * 60 * 60 * 1000L;
    private final SecretKey signingKey;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(String email) {
        return gerarToken(email, Role.CIDADAO);
    }

    public String gerarToken(String email, Role role) {
        Date agora = new Date();
        return Jwts.builder()
            .id(UUID.randomUUID().toString())
                .subject(email)
                .claim("role", role.name())
                .issuedAt(agora)
                .expiration(new Date(agora.getTime() + TOKEN_VALIDITY_MILLIS))
                .signWith(signingKey)
                .compact();
    }

    public String extrairEmail(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public Role extrairRole(String token) {
        String role = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
        return Role.valueOf(role);
    }

    public String extrairId(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getId();
    }

    public Instant extrairExpiracao(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration()
                .toInstant();
    }

    public boolean validarToken(String token) {
        try {
            return extrairEmail(token) != null && extrairRole(token) != null && extrairId(token) != null;
        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }
}