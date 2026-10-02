package com.example.conecta.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "respostas_ocorrencia")
public class RespostaOcorrenciaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private OcorrenciaModel ocorrencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private UsuarioModel autor;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensagem;

    @Column(nullable = false, updatable = false)
    private Instant criadaEm;

    public RespostaOcorrenciaModel() {
    }

    public RespostaOcorrenciaModel(OcorrenciaModel ocorrencia, UsuarioModel autor, String mensagem) {
        this.ocorrencia = ocorrencia;
        this.autor = autor;
        this.mensagem = mensagem;
    }

    @PrePersist
    void aoCriar() {
        criadaEm = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public UsuarioModel getAutor() {
        return autor;
    }

    public String getMensagem() {
        return mensagem;
    }

    public Instant getCriadaEm() {
        return criadaEm;
    }
}