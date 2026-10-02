"use client";

import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  analyzeOccurrenceUrgency,
  listOccurrences,
  type Occurrence,
  type UrgencyAnalysis,
} from "../../lib/api";

export function PainelDaPrefeitura() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listOccurrences("PREFEITURA")
      .then(setOccurrences)
      .finally(() => setLoading(false));
  }, []);

  const inProgress = occurrences.filter(
    (item) => item.status !== "RESOLVIDO",
  ).length;
  const resolved = occurrences.filter(
    (item) => item.status === "RESOLVIDO",
  ).length;

  return (
    <main className="dashboard-page container">
      <div className="page-heading">
        <div>
          <div className="section-kicker">GESTÃO PÚBLICA</div>
          <h1>Painel da prefeitura</h1>
          <p>Acompanhe os problemas da cidade e organize os atendimentos.</p>
        </div>
      </div>
      <div className="summary-row">
        <div className="summary-card">
          <span className="summary-icon blue-bg">
            <MapPin size={19} />
          </span>
          <div>
            <small>Ocorrências recebidas</small>
            <strong>{loading ? "-" : occurrences.length}</strong>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon yellow-bg">
            <Clock3 size={19} />
          </span>
          <div>
            <small>Em atendimento</small>
            <strong>{loading ? "-" : inProgress}</strong>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon green-bg">
            <Check size={19} />
          </span>
          <div>
            <small>Resolvidas</small>
            <strong>{loading ? "-" : resolved}</strong>
          </div>
        </div>
      </div>
      <section className="list-card">
        <div className="list-toolbar">
          <div>
            <h2>Resumo operacional</h2>
            <p>Indicadores demonstrativos de atendimento.</p>
          </div>
          <BarChart3 size={22} />
        </div>
        <div className="city-tip">
          <Check size={20} />
          <div>
            <strong>Atendimento em andamento</strong>
            <p>
              {loading
                ? "Carregando ocorrências do município..."
                : `${occurrences.length} ocorrências recebidas pelo canal da prefeitura.`}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PrefeituraIa() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [analysis, setAnalysis] = useState<UrgencyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listOccurrences("PREFEITURA")
      .then((items) => {
        if (!active) return;
        setOccurrences(items);
        setSelectedId(items[0] ? String(items[0].id) : "");
      })
      .catch(() => {
        if (active)
          setError("Não foi possível carregar as ocorrências da prefeitura.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedOccurrence = occurrences.find(
    (occurrence) => String(occurrence.id) === selectedId,
  );

  const analyzeSelected = async () => {
    if (!selectedOccurrence) return;
    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    try {
      const result = await analyzeOccurrenceUrgency(selectedOccurrence.id);
      setAnalysis(result);
      setOccurrences((current) =>
        current.map((occurrence) =>
          occurrence.id === result.ocorrenciaId
            ? { ...occurrence, urgencia: result.urgencia }
            : occurrence,
        ),
      );
    } catch {
      setError(
        "Não foi possível analisar este relato. Confira sua conexão e tente novamente.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const urgencyLabels = {
    BAIXA: { label: "Baixa urgência", tone: "low" },
    MEDIA: { label: "Média urgência", tone: "medium" },
    ALTA: { label: "Alta urgência", tone: "high" },
    CRITICA: { label: "Urgência crítica", tone: "critical" },
  } as const;
  const resultPresentation = analysis ? urgencyLabels[analysis.urgencia] : null;

  return (
    <main className="dashboard-page container prefeitura-ia-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker green">TRIAGEM EXPLICÁVEL / BETA</div>
          <h1>IA de urgência</h1>
          <p>
            Analise os relatos recebidos e consulte os fatores da classificação.
          </p>
        </div>
        <span className="demo-badge">Regras v1</span>
      </div>
      <section className="urgency-card">
        <div className="urgency-intro">
          <span className="urgency-icon">
            <BrainCircuit size={24} />
          </span>
          <div>
            <h2>Qual caso deve ser priorizado?</h2>
            <p>
              Selecione uma ocorrência real. A análise atualiza a urgência salva
              no sistema.
            </p>
          </div>
        </div>
        <label htmlFor="urgency-case">Caso para análise</label>
        <select
          id="urgency-case"
          value={selectedId}
          disabled={loading || occurrences.length === 0}
          onChange={(event) => {
            setSelectedId(event.target.value);
            setAnalysis(null);
            setError("");
          }}
        >
          <option value="">
            {loading ? "Carregando ocorrências..." : "Selecione uma ocorrência"}
          </option>
          {occurrences.map((occurrence) => (
            <option key={occurrence.id} value={occurrence.id}>
              #{occurrence.id} · {occurrence.titulo}
              {occurrence.bairro ? ` · ${occurrence.bairro}` : ""}
            </option>
          ))}
        </select>
        {selectedOccurrence && (
          <div className="urgency-case-preview">
            <strong>{selectedOccurrence.titulo}</strong>
            <span>
              {selectedOccurrence.bairro ||
                selectedOccurrence.endereco ||
                "Local não informado"}
              {selectedOccurrence.urgencia
                ? ` · Urgência atual: ${urgencyLabels[selectedOccurrence.urgencia].label.toLowerCase()}`
                : " · Ainda sem classificação"}
            </span>
            <p>{selectedOccurrence.descricao}</p>
          </div>
        )}
        {!loading && occurrences.length === 0 && !error && (
          <p className="urgency-empty">
            Ainda não há ocorrências para analisar.
          </p>
        )}
        <button
          className="primary-btn urgency-button"
          onClick={analyzeSelected}
          disabled={!selectedOccurrence || analyzing || loading}
        >
          {analyzing ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <BrainCircuit size={18} />
          )}
          {analyzing ? "Analisando..." : "Analisar urgência"}
        </button>
        {error && (
          <p className="urgency-error" role="alert">
            {error}
          </p>
        )}
        {analysis && resultPresentation && (
          <div className={`urgency-result ${resultPresentation.tone}`}>
            <div className="urgency-result-heading">
              {analysis.urgencia === "ALTA" ||
              analysis.urgencia === "CRITICA" ? (
                <AlertTriangle size={22} />
              ) : (
                <ShieldCheck size={22} />
              )}
              <div>
                <small>Classificação sugerida</small>
                <strong>{resultPresentation.label}</strong>
              </div>
              <b>
                {analysis.pontuacaoRisco}
                <small>/100</small>
              </b>
            </div>
            <h3>Fatores considerados</h3>
            <ul className="urgency-factors">
              {analysis.fatores.map((factor) => (
                <li key={factor}>{factor}</li>
              ))}
            </ul>
            <p className="urgency-recommendation">
              <strong>Próxima ação sugerida:</strong> {analysis.recomendacao}
            </p>
            <span>
              Triagem automática demonstrativa. A decisão final é da equipe
              responsável.
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
