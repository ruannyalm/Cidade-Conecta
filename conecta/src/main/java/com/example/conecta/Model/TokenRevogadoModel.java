package com.example.conecta.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "tokens_revogados")
public class TokenRevogadoModel {

    @Id
    @Column(name = "token_id", nullable = false, length = 36)
    private String id;

    @Column(name = "expira_em", nullable = false)
    private Instant expiraEm;

    public TokenRevogadoModel() {
    }

    public TokenRevogadoModel(String id, Instant expiraEm) {
        this.id = id;
        this.expiraEm = expiraEm;
    }

    public String getId() {
        return id;
    }

    public Instant getExpiraEm() {
        return expiraEm;
    }
}