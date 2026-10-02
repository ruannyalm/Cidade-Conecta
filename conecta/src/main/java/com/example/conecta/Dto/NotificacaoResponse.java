package com.example.conecta.Dto;

import java.time.Instant;

public record NotificacaoResponse(Long id, Long ocorrenciaId, String mensagem, boolean lida, Instant criadaEm) {
}