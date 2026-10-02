"use client";

import { ArrowRight, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react";
import { useState } from "react";

export function TelaDeLogin({
  onLogin,
  onRegister,
}: {
  onLogin: (email: string, senha: string) => Promise<void>;
  onRegister: (nome: string, email: string, senha: string) => Promise<unknown>;
}) {
  const [registerMode, setRegisterMode] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (registerMode) {
        await onRegister(nome, email, senha);
        setRegisterMode(false);
        setSuccess("Cadastro realizado. Agora entre com seu e-mail e senha.");
        setNome("");
      } else {
        await onLogin(email, senha);
      }
    } catch {
      setError(
        registerMode
          ? "Não foi possível cadastrar. Confira os dados e tente novamente."
          : "Não foi possível entrar. Confira seu e-mail e senha.",
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setRegisterMode((value) => !value);
    setError("");
    setSuccess("");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="logo-mark">
            <MapPin size={19} />
          </span>
          <strong>
            Cidade<span className="logo-green">Conecta</span>
          </strong>
        </div>
        <div className="section-kicker green">
          {registerMode ? "NOVA CONTA CIDADÃ" : "BEM-VINDO DE VOLTA"}
        </div>
        <h1>
          {registerMode
            ? "Crie sua conta cidadã."
            : "Entre para acompanhar sua cidade."}
        </h1>
        <p>
          {registerMode
            ? "Registre ocorrências e acompanhe as melhorias da sua cidade."
            : "Veja suas ocorrências, apoios e atualizações em um só lugar."}
        </p>
        <form onSubmit={submitForm}>
          {registerMode && (
            <>
              <label htmlFor="register-name">Nome</label>
              <div className="auth-input">
                <UserRound size={17} />
                <input
                  id="register-name"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  required
                />
              </div>
            </>
          )}
          <label htmlFor="login-email">E-mail</label>
          <div className="auth-input">
            <Mail size={17} />
            <input
              id="login-email"
              type="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <label htmlFor="login-password">Senha</label>
          <div className="auth-input">
            <LockKeyhole size={17} />
            <input
              id="login-password"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Aguarde..." : registerMode ? "Criar conta" : "Entrar"}
            <ArrowRight size={17} />
          </button>
        </form>
        <button className="auth-link" type="button" onClick={toggleMode}>
          {registerMode ? "Já tenho uma conta" : "Ainda não tenho uma conta"}
        </button>
        {!registerMode && (
          <small className="auth-note">
            O acesso à área da prefeitura depende da role da conta cadastrada.
          </small>
        )}
      </section>
    </main>
  );
}
