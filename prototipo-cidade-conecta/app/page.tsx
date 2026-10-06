"use client";

import {
  Bell,
  BrainCircuit,
  Check,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  clearSession,
  getSession,
  login,
  logout,
  registerCitizen,
  saveSession,
  type UserSession,
} from "./lib/api";
import { Logo, PageName } from "./components/cidade-conecta/shared";
import { CidadesERegioes } from "./paginas/cidades/CidadesERegioes";
import { IaEVoz } from "./paginas/ia/IaEVoz";
import { TelaInicial } from "./paginas/home/TelaInicial";
import { TelaDeLogin } from "./paginas/login/TelaDeLogin";
import { MapaDeOcorrencias } from "./paginas/mapa/MapaDeOcorrencias";
import { MinhasOcorrencias } from "./paginas/ocorrencias/MinhasOcorrencias";
import {
  ModalDeOcorrencia,
  ReportTab,
} from "./paginas/relatos/ModalDeOcorrencia";
import {
  PainelDaPrefeitura,
  PrefeituraIa,
} from "./paginas/prefeitura/PainelDaPrefeitura";
import { MinhaConta } from "./paginas/usuario/MinhaConta";

const navigation: { id: PageName; label: string }[] = [
  { id: "inicio", label: "Início" },
  { id: "ocorrencias", label: "Minhas ocorrências" },
  { id: "cidades", label: "Cidades e regiões" },
  { id: "ia", label: "IA e voz" },
  { id: "mapa", label: "Mapa" },
];

export default function Page() {
  const [screen, setScreen] = useState<PageName | "prefeitura">("inicio");
  const [session, setSession] = useState<UserSession | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTab, setReportTab] = useState<ReportTab>("voz");
  const [reportAddress, setReportAddress] = useState("");
  const [occurrencesRevision, setOccurrencesRevision] = useState(0);
  const [toast, setToast] = useState("");
  const [prefeituraPage, setPrefeituraPage] = useState<
    "painel" | "mapa" | "ia"
  >("painel");

  useEffect(() => {
    const storedSession = getSession();
    setSession(storedSession);
    if (storedSession) {
      setScreen(storedSession.role === "PREFEITURA" ? "prefeitura" : "inicio");
    }
    setSessionReady(true);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }, []);

  const navigate = (page: PageName | "prefeitura") => {
    setScreen(page);
    setMenuOpen(false);
  };

  const handleLogin = async (email: string, senha: string) => {
    const loggedSession = await login(email, senha);
    saveSession(loggedSession);
    setSession(loggedSession);
    setScreen(loggedSession.role === "PREFEITURA" ? "prefeitura" : "inicio");
  };

  const handleRegister = (nome: string, email: string, senha: string) =>
    registerCitizen(nome, email, senha);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // A sessão local precisa ser limpa mesmo quando o backend está indisponível.
    } finally {
      clearSession();
      setSession(null);
      setSessionReady(true);
    }
  };

  const openReport = (tab: ReportTab = "voz", address = "") => {
    setReportTab(tab);
    setReportAddress(address);
    setReportOpen(true);
  };

  if (!sessionReady || !session) {
    return <TelaDeLogin onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (session.role === "PREFEITURA" && screen === "prefeitura") {
    return (
      <div className="app-shell prefeitura-shell">
        <header className="topbar prefeitura-topbar">
          <div className="topbar-inner">
            <button className="logo-btn" onClick={() => navigate("prefeitura")}>
              <Logo />
            </button>
            <div className="prefeitura-heading">
              <strong>Área da prefeitura</strong>
              <span>Painel de gestão pública</span>
            </div>
            <nav
              className="prefeitura-nav"
              aria-label="Navegação da prefeitura"
            >
              <button
                className={prefeituraPage === "painel" ? "active" : ""}
                onClick={() => setPrefeituraPage("painel")}
              >
                <LayoutDashboard size={16} /> Painel
              </button>
              <button
                className={prefeituraPage === "mapa" ? "active" : ""}
                onClick={() => setPrefeituraPage("mapa")}
              >
                <Map size={16} /> Mapa
              </button>
              <button
                className={prefeituraPage === "ia" ? "active" : ""}
                onClick={() => setPrefeituraPage("ia")}
              >
                <BrainCircuit size={16} /> IA de urgência
              </button>
            </nav>
            <button className="prefeitura-logout" onClick={handleLogout}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        </header>
        {prefeituraPage === "painel" && <PainelDaPrefeitura />}
        {prefeituraPage === "mapa" && (
          <MapaDeOcorrencias
            notify={notify}
            role="PREFEITURA"
            refreshKey={occurrencesRevision}
          />
        )}
        {prefeituraPage === "ia" && <PrefeituraIa />}
      </div>
    );
  }

  return (
    <div className="app-shell">
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
      <header className="topbar">
        <div className="topbar-inner">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <button className="logo-btn" onClick={() => navigate("inicio")}>
            <Logo />
          </button>
          <nav className={menuOpen ? "nav open" : "nav"}>
            {navigation.map((item) => (
              <button
                key={item.id}
                className={screen === item.id ? "nav-active" : ""}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="top-actions">
            <button
              className="icon-btn"
              aria-label="Notificações"
              onClick={() => setNotificationsOpen((value) => !value)}
            >
              <Bell size={19} />
            </button>
            <button
              className="user-profile"
              onClick={() => navigate("usuario")}
            >
              <span className="avatar">
                {session.nome.slice(0, 2).toUpperCase()}
              </span>
              <span>{session.nome}</span>
            </button>
            {notificationsOpen && (
              <div className="notification-panel">
                <div>
                  <strong>Notificações</strong>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Fechar notificações"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p>Atualizações da sua participação aparecerão aqui.</p>
              </div>
            )}
          </div>
        </div>
      </header>
      {screen === "inicio" && (
        <TelaInicial
          onNavigate={() => navigate("ocorrencias")}
          onNewReport={openReport}
          notify={notify}
        />
      )}
      {screen === "ocorrencias" && (
        <MinhasOcorrencias onNewReport={openReport} notify={notify} />
      )}
      {screen === "cidades" && (
        <CidadesERegioes />
      )}
      {screen === "ia" && <IaEVoz onNewReport={openReport} notify={notify} />}
      {screen === "mapa" && (
        <MapaDeOcorrencias
          notify={notify}
          role="CIDADAO"
          onNewReport={(address) => openReport("texto", address)}
          refreshKey={occurrencesRevision}
        />
      )}
      {screen === "usuario" && (
        <MinhaConta
          nome={session.nome}
          notify={notify}
          onLogout={handleLogout}
        />
      )}
      <footer>
        <div className="container footer-inner">
          <Logo />
          <span>Todo cidadão tem uma voz. Toda cidade pode melhorar.</span>
          <span>© 2024 CidadeConecta · Projeto pessoal</span>
        </div>
      </footer>
      {reportOpen && (
        <ModalDeOcorrencia
          initialAddress={reportAddress}
          tab={reportTab}
          setTab={setReportTab}
          onClose={() => setReportOpen(false)}
          onCreated={() => setOccurrencesRevision((revision) => revision + 1)}
          notify={notify}
        />
      )}
    </div>
  );
}
