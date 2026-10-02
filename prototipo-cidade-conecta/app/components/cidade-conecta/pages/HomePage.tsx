"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Mic,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";
import { problems, Status } from "../shared";

type Props = {
  onNavigate: (page: "ocorrencias") => void;
  onNewReport: (tab?: "voz" | "texto") => void;
  notify: (message: string) => void;
};

export function HomePage({ onNavigate, onNewReport, notify }: Props) {
  return (
    <main>
      <section className="hero container">
        <div className="hero-copy">
          <div className="hero-slogan">
            <h1>
              <span>Sua voz</span> <strong>muda a cidade</strong>
            </h1>
            <div className="hero-media-actions">
              <button
                className="hero-audio-btn"
                onClick={() => onNewReport("voz")}
                aria-label="Toque para falar e registrar uma ocorrência por áudio"
              >
                <span className="hero-audio-icon">
                  <Mic size={28} />
                </span>
                <span className="hero-audio-copy">
                  <strong>Toque para falar</strong>
                  <small>Registre sua ocorrência por áudio</small>
                </span>
                <ArrowRight size={19} className="hero-audio-arrow" />
              </button>
              <div className="hero-secondary-actions">
                <button
                  className="hero-register-btn"
                  onClick={() => onNewReport("texto")}
                >
                  <Plus size={17} /> Escrever relato
                </button>
                <button
                  className="hero-follow-btn"
                  onClick={() => onNavigate("ocorrencias")}
                >
                  <FileText size={17} /> Acompanhar relatos
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/cidade-brasileira.png"
            alt="Praça e avenida em uma cidade brasileira"
          />
          <div className="city-caption">
            <MapPin size={15} />
            <strong>CidadeConecta</strong>
            <span>Uma rede para cuidar do que é de todos</span>
          </div>
          <div className="hero-console">
            <span className="console-label">REDE DE PARTICIPAÇÃO</span>
            <div className="console-line">
              <span className="console-indicator" />
              <strong>Da comunidade para a cidade</strong>
              <span className="console-open">ABERTO</span>
            </div>
            <p>Relatos, acompanhamento e respostas em um só lugar.</p>
            <div className="console-footer">
              <span>01 / CIDADE CONECTA</span>
              <span>
                <MapPin size={13} /> Brasil
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="prototype-note container">
        <CircleHelp size={15} />
        <strong>Protótipo demonstrativo</strong>
        <span>
          Os números e informações apresentados são simulados para fins de
          demonstração.
        </span>
      </div>
      <section className="occurrences-section container">
        <div className="section-heading">
          <div>
            <div className="section-kicker">ACOMPANHE DE PERTO</div>
            <h2>Suas ocorrências</h2>
            <p>Acompanhe tudo o que você já comunicou à prefeitura.</p>
          </div>
          <button
            className="text-btn"
            onClick={() => onNavigate("ocorrencias")}
          >
            Ver todas <ArrowRight size={16} />
          </button>
        </div>
        <div className="occurrence-grid">
          {problems.map((problem, index) => (
            <button
              className="occurrence-card"
              key={problem.name}
              onClick={() =>
                notify(`Ocorrência ${index + 1}: ${problem.status}`)
              }
            >
              <div className="occ-top">
                <span className="problem-icon">{problem.icon}</span>
                <Status color={problem.color}>{problem.status}</Status>
              </div>
              <h3>{problem.name}</h3>
              <div className="occ-meta">
                <span>
                  <MapPin size={14} />
                  {problem.neighborhood}
                </span>
                <span>
                  <Clock3 size={14} />
                  {problem.date}
                </span>
              </div>
              <div className="occ-bottom">
                <span>{problem.votes} pessoas relataram</span>
                <ChevronRight size={17} />
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="voice-section container">
        <div className="voice-card">
          <div className="voice-content">
            <div className="section-kicker green">
              INCLUSÃO EM PRIMEIRO LUGAR
            </div>
            <h2>
              Não sabe ler ou escrever? <span>Tudo bem.</span>
            </h2>
            <p>
              Sua voz também transforma a cidade. Fale naturalmente e nossa
              inteligência artificial cuida do resto.
            </p>
            <button className="voice-cta" onClick={() => onNewReport()}>
              <span className="big-mic">
                <Plus size={26} />
              </span>
              <span>
                <strong>Toque para falar</strong>
                <small>Você pode falar em vez de escrever</small>
              </span>
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="conversation-preview">
            <strong>CidadeConecta IA</strong>
            <p>Assistente de voz para registrar sua ocorrência.</p>
            <span>
              <Check size={15} /> Pronto para ajudar
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
