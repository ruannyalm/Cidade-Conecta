"use client";

import {
  ChevronRight,
  FileText,
  Mic,
  Plus,
  ShieldCheck,
  Volume2,
} from "lucide-react";

export function IaPage({
  onNewReport,
  notify,
}: {
  onNewReport: (tab?: "voz" | "texto" | "midia" | "identidade") => void;
  notify: (message: string) => void;
}) {
  return (
    <main className="dashboard-page container ia-screen">
      <div className="page-heading">
        <div>
          <div className="section-kicker green"></div>
          <h1>Fale com o CidadeConecta</h1>
          <p>
            Escolha como quer registrar sua denúncia. Você pode falar, escrever
            ou enviar uma imagem.
          </p>
        </div>
      </div>
      <div className="ia-layout">
        <section className="ia-voice-panel">
          <div className="ia-orb">
            <Mic size={42} />
          </div>
          <h2>Toque para gravar</h2>
          <p>Fale naturalmente. Não precisa saber escrever.</p>
          <button
            className="modal-mic-btn ia-main-button"
            onClick={() => onNewReport("voz")}
          >
            <Mic size={24} />
            <span>GRAVAR DENÚNCIA</span>
          </button>
          <button
            className="listen-link prominent-listen"
            onClick={() => notify("Instruções sendo lidas em voz alta")}
          >
            <Volume2 size={21} />
            <span>Ouvir instruções</span>
            <small>Toque aqui para escutar</small>
          </button>
        </section>
        <section className="ia-options">
          <button onClick={() => onNewReport("texto")}>
            <FileText size={24} />
            <div>
              <strong>Escrever denúncia</strong>
              <span>Digite o que aconteceu</span>
            </div>
            <ChevronRight size={19} />
          </button>
          <button onClick={() => onNewReport("midia")}>
            <Plus size={24} />
            <div>
              <strong>Enviar foto ou vídeo</strong>
              <span>Mostre o problema à prefeitura</span>
            </div>
            <ChevronRight size={19} />
          </button>
          <button onClick={() => onNewReport("identidade")}>
            <ShieldCheck size={24} />
            <div>
              <strong>Escolher identificação</strong>
              <span>Você decide se quer se identificar</span>
            </div>
            <ChevronRight size={19} />
          </button>
        </section>
      </div>
    </main>
  );
}
