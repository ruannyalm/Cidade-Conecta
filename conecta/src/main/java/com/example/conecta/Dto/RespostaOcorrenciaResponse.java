package com.example.conecta.Dto;

import java.time.Instant;

public record RespostaOcorrenciaResponse(Long id, String autor, String mensagem, Instant criadaEm) {
}