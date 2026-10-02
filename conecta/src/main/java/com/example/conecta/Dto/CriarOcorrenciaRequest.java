package com.example.conecta.Dto;

import com.example.conecta.Model.CategoriaOcorrencia;

public record CriarOcorrenciaRequest(
        String titulo,
        String descricao,
        CategoriaOcorrencia categoria,
        String endereco,
        String bairro,
        Double latitude,
        Double longitude,
        boolean anonima,
        boolean enviadaPorAudio) {
}