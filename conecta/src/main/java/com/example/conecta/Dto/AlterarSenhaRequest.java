package com.example.conecta.Dto;

public class AlterarSenhaRequest {

    private String senhaAtual;
    private String novaSenha;

    public AlterarSenhaRequest() {
    }

    public String getSenhaAtual() {
        return senhaAtual;
    }

    public void setSenhaAtual(String senhaAtual) {
        this.senhaAtual = senhaAtual;
    }

    public String getNovaSenha() {
        return novaSenha;
    }

    public void setNovaSenha(String novaSenha) {
        this.novaSenha = novaSenha;
    }
}