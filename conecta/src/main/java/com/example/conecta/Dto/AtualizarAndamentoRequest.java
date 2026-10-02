package com.example.conecta.Dto;

import com.example.conecta.Model.StatusOcorrencia;

public record AtualizarAndamentoRequest(StatusOcorrencia status, String resposta) {
}