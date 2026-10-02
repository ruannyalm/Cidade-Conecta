package com.example.conecta.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "midias_ocorrencia")
public class MidiaOcorrenciaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private OcorrenciaModel ocorrencia;

    @Column(nullable = false, unique = true, length = 100)
    private String nomeArmazenado;

    @Column(nullable = false, length = 255)
    private String nomeOriginal;

    @Column(nullable = false, length = 120)
    private String tipoConteudo;

    @Column(nullable = false)
    private long tamanho;

    public MidiaOcorrenciaModel() {
    }

    public MidiaOcorrenciaModel(OcorrenciaModel ocorrencia, String nomeArmazenado, String nomeOriginal,
            String tipoConteudo, long tamanho) {
        this.ocorrencia = ocorrencia;
        this.nomeArmazenado = nomeArmazenado;
        this.nomeOriginal = nomeOriginal;
        this.tipoConteudo = tipoConteudo;
        this.tamanho = tamanho;
    }

    public Long getId() {
        return id;
    }

    public OcorrenciaModel getOcorrencia() {
        return ocorrencia;
    }

    public String getNomeArmazenado() {
        return nomeArmazenado;
    }

    public String getNomeOriginal() {
        return nomeOriginal;
    }

    public String getTipoConteudo() {
        return tipoConteudo;
    }

    public long getTamanho() {
        return tamanho;
    }
}