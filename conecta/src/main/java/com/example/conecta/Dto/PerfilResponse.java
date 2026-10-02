package com.example.conecta.Dto;

import com.example.conecta.Model.Role;

public class PerfilResponse {

    private String nome;
    private String email;
    private String regiao;
    private Role role;

    public PerfilResponse(String nome, String email, String regiao, Role role) {
        this.nome = nome;
        this.email = email;
        this.regiao = regiao;
        this.role = role;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getRegiao() {
        return regiao;
    }

    public Role getRole() {
        return role;
    }
}