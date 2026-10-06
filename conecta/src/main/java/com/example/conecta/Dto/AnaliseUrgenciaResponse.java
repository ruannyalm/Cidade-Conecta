package com.example.conecta.Dto;

import com.example.conecta.Model.NivelUrgencia;

import java.util.List;

public record AnaliseUrgenciaResponse(
        Long ocorrenciaId,
        NivelUrgencia urgencia,
        int pontuacaoRisco,
        List<String> fatores,
        String recomendacao,
        String comoResolver,
        String metodo) {
}