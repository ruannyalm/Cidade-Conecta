package com.example.conecta.Dto;

import com.example.conecta.Model.CategoriaOcorrencia;
import com.example.conecta.Model.NivelUrgencia;
import com.example.conecta.Model.StatusOcorrencia;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record OcorrenciaResponse(
        Long id,
        String titulo,
        String descricao,
        CategoriaOcorrencia categoria,
        String endereco,
        String bairro,
        Double latitude,
        Double longitude,
        boolean anonima,
        String autor,
        StatusOcorrencia status,
        NivelUrgencia urgencia,
        long apoios,
        boolean acompanhada,
        boolean enviadaPorAudio,
        Instant criadaEm,
        List<MidiaResponse> midias,
        List<RespostaOcorrenciaResponse> respostas) {
}