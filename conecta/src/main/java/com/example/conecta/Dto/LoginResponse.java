package com.example.conecta.Dto;

import com.example.conecta.Model.Role;

public class LoginResponse {

    private String token;
    private String nome;
    private String email;
    private Role role;

    public LoginResponse() {
    }

    public LoginResponse(String token, String nome, String email, Role role) {
        this.token = token;
        this.nome = nome;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}