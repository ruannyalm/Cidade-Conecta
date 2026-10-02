package com.example.conecta.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "ocorrencias")
public class OcorrenciaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private CategoriaOcorrencia categoria;

    @Column(length = 300)
    private String endereco;

    @Column(length = 120)
    private String bairro;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private boolean anonima;

    @Column(nullable = false)
    private boolean enviadaPorAudio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private StatusOcorrencia status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NivelUrgencia urgencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private UsuarioModel autor;

    @Column(nullable = false, updatable = false)
    private Instant criadaEm;

    @Column(nullable = false)
    private Instant atualizadaEm;

    public OcorrenciaModel() {
    }

    @PrePersist
    void aoCriar() {
        Instant agora = Instant.now();
        criadaEm = agora;
        atualizadaEm = agora;
        if (status == null) {
            status = StatusOcorrencia.EM_ANALISE;
        }
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadaEm = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public CategoriaOcorrencia getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaOcorrencia categoria) {
        this.categoria = categoria;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public boolean isAnonima() {
        return anonima;
    }

    public void setAnonima(boolean anonima) {
        this.anonima = anonima;
    }

    public boolean isEnviadaPorAudio() {
        return enviadaPorAudio;
    }

    public void setEnviadaPorAudio(boolean enviadaPorAudio) {
        this.enviadaPorAudio = enviadaPorAudio;
    }

    public StatusOcorrencia getStatus() {
        return status;
    }

    public void setStatus(StatusOcorrencia status) {
        this.status = status;
    }

    public NivelUrgencia getUrgencia() {
        return urgencia;
    }

    public void setUrgencia(NivelUrgencia urgencia) {
        this.urgencia = urgencia;
    }

    public UsuarioModel getAutor() {
        return autor;
    }

    public void setAutor(UsuarioModel autor) {
        this.autor = autor;
    }

    public Instant getCriadaEm() {
        return criadaEm;
    }

    public Instant getAtualizadaEm() {
        return atualizadaEm;
    }
}