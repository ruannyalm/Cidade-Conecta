package com.example.conecta.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "apoios_ocorrencia", uniqueConstraints = @UniqueConstraint(columnNames = {"ocorrencia_id", "usuario_id"}))
public class ApoioOcorrenciaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private OcorrenciaModel ocorrencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioModel usuario;

    public ApoioOcorrenciaModel() {
    }

    public ApoioOcorrenciaModel(OcorrenciaModel ocorrencia, UsuarioModel usuario) {
        this.ocorrencia = ocorrencia;
        this.usuario = usuario;
    }
}