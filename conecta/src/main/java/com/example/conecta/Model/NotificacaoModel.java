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
@Table(name = "notificacoes")
public class NotificacaoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioModel usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private OcorrenciaModel ocorrencia;

    @Column(nullable = false, length = 300)
    private String mensagem;

    @Column(nullable = false)
    private boolean lida;

    @Column(nullable = false, updatable = false)
    private Instant criadaEm;

    public NotificacaoModel() {
    }

    public NotificacaoModel(UsuarioModel usuario, OcorrenciaModel ocorrencia, String mensagem) {
        this.usuario = usuario;
        this.ocorrencia = ocorrencia;
        this.mensagem = mensagem;
        this.lida = false;
    }

    @PrePersist
    void aoCriar() {
        criadaEm = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public UsuarioModel getUsuario() {
        return usuario;
    }

    public OcorrenciaModel getOcorrencia() {
        return ocorrencia;
    }

    public String getMensagem() {
        return mensagem;
    }

    public boolean isLida() {
        return lida;
    }

    public void setLida(boolean lida) {
        this.lida = lida;
    }

    public Instant getCriadaEm() {
        return criadaEm;
    }
}