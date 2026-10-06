"use client";

import { BarChart3, Bell, LogOut, ShieldCheck, Volume2 } from "lucide-react";

export function MinhaConta({
  nome,
  notify,
  onLogout,
}: {
  nome: string;
  notify: (message: string) => void;
  onLogout: () => void;
}) {
  return (
    <main className="dashboard-page container user-screen">
      <div className="page-heading">
        <div>
          <div className="section-kicker green">ESPAÇO DO CIDADÃO</div>
          <h1>Minha conta</h1>
          <p>Gerencie seus dados, preferências e acompanhe sua participação.</p>
        </div>
      </div>
      <section className="profile-hero">
        <div className="profile-avatar">{nome.slice(0, 2).toUpperCase()}</div>
        <div className="profile-copy">
          <span className="profile-label">Olá, {nome}</span>
          <h2>Sua participação importa</h2>
          <p>Você já ajudou a melhorar 7 pontos da sua cidade.</p>
          <div className="profile-actions">
            <button
              className="profile-action primary"
              onClick={() => notify("Seu impacto já ajudou 7 pontos da cidade")}
            >
              Ver meu impacto
            </button>
            <button
              className="profile-action secondary"
              onClick={() => notify("Perfil atualizado")}
            >
              Editar perfil
            </button>
            <button className="profile-action danger" onClick={onLogout}>
              <LogOut size={15} /> Sair da conta
            </button>
          </div>
        </div>
      </section>
      <div className="user-grid">
        <section className="user-card">
          <div className="card-title">
            <div>
              <h2>Resumo da participação</h2>
              <p>Veja seus principais números.</p>
            </div>
            <BarChart3 size={20} />
          </div>
          <div className="user-stats">
            <div>
              <strong>12</strong>
              <span>ocorrências</span>
            </div>
            <div>
              <strong>7</strong>
              <span>resolvidas</span>
            </div>
            <div>
              <strong>24</strong>
              <span>apoios recebidos</span>
            </div>
          </div>
        </section>
        <section className="user-card">
          <div className="card-title">
            <div>
              <h2>Preferências</h2>
              <p>Como quer usar o CidadeConecta?</p>
            </div>
            <ShieldCheck size={20} />
          </div>
          <button
            className="preference-row"
            onClick={() => notify("Notificações ativadas")}
          >
            <Bell size={18} />
            <span>
              <strong>Notificações de andamento</strong>
              <small>Receber atualizações das suas ocorrências</small>
            </span>
            <span className="toggle-on">Ativo</span>
          </button>
          <button
            className="preference-row"
            onClick={() => notify("Leitura ativada")}
          >
            <Volume2 size={18} />
            <span>
              <strong>Leitura em voz alta</strong>
              <small>Ouvir instruções e status importantes</small>
            </span>
            <span className="toggle-on">Ativo</span>
          </button>
        </section>
      </div>
    </main>
  );
}
