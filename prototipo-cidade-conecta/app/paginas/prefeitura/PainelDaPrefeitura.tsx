"use client";

import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  analyzeOccurrenceUrgency,
  listOccurrences,
  updateOccurrenceStatus,
  type Occurrence,
  type StatusOcorrencia,
  type UrgencyAnalysis,
} from "../../lib/api";
import { acopiaraLocations } from "../../components/cidade-conecta/shared";

const statusOptions: { value: StatusOcorrencia; label: string }[] = [
  { value: "EM_ANALISE", label: "Em análise" },
  { value: "AGENDADO", label: "Agendado" },
  { value: "EM_PROCESSO", label: "Em atendimento" },
  { value: "RESOLVIDO", label: "Resolvido" },
];

function isOccurrenceStatus(value: FormDataEntryValue | null): value is StatusOcorrencia {
  return statusOptions.some((option) => option.value === value);
}

function AtendimentoOcorrencia({
  occurrence,
  onUpdated,
}: {
  occurrence: Occurrence;
  onUpdated: (id: number, status: StatusOcorrencia) => void;
}) {
  const [status, setStatus] = useState(occurrence.status);
  const [resposta, setResposta] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => setStatus(occurrence.status), [occurrence.status]);

  const submitUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await updateOccurrenceStatus(occurrence.id, status, resposta.trim());
      onUpdated(occurrence.id, status);
      setResposta("");
      setNotice("Atualização enviada ao cidadão.");
    } catch {
      setError("Não foi possível atualizar este relato. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="prefeitura-occurrence-card">
      <div className="prefeitura-occurrence-heading">
        <div>
          <strong>{occurrence.titulo}</strong>
          <span>
            {occurrence.endereco || "Rua não informada"} ·{" "}
            {occurrence.bairro || "Acopiara · CE"}
          </span>
        </div>
        <span className="prefeitura-occurrence-status">
          {statusOptions.find((option) => option.value === occurrence.status)?.label}
        </span>
      </div>
      <p>{occurrence.descricao}</p>
      <small>
        Relato de {occurrence.anonima ? "cidadão anônimo" : occurrence.autor || "cidadão"} ·{" "}
        {new Date(occurrence.criadaEm).toLocaleDateString("pt-BR")}
      </small>
      {occurrence.respostas?.map((item) => (
        <blockquote className="prefeitura-occurrence-reply" key={item.id}>
          <strong>Resposta de {item.autor}</strong>
          <span>{item.mensagem}</span>
        </blockquote>
      ))}
      <form className="prefeitura-occurrence-form" onSubmit={submitUpdate}>
        <label>
          Atualizar andamento
          <select
            value={status}
            onChange={(event) => {
              const value = event.target.value;
              if (isOccurrenceStatus(value)) setStatus(value);
            }}
          >
            {statusOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Resposta ao cidadão
          <textarea
            value={resposta}
            onChange={(event) => setResposta(event.target.value)}
            placeholder="Escreva uma atualização para quem registrou..."
            rows={2}
          />
        </label>
        <button className="primary-btn" type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />}
          {saving ? "Enviando..." : "Enviar atualização"}
        </button>
        {error && <p className="prefeitura-occurrence-error" role="alert">{error}</p>}
        {notice && <p className="prefeitura-occurrence-notice" role="status">{notice}</p>}
      </form>
    </article>
  );
}

export function PainelDaPrefeitura() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listOccurrences("PREFEITURA")
      .then((items) =>
        setOccurrences(
          items.filter((item) =>
            acopiaraLocations.some(
              (location) =>
                location.toLocaleLowerCase("pt-BR") ===
                item.endereco?.trim().toLocaleLowerCase("pt-BR"),
            ),
          ),
        ),
      )
      .catch(() => setError("Não foi possível carregar os relatos da Prefeitura."))
      .finally(() => setLoading(false));
  }, []);

  const inProgress = occurrences.filter(
    (item) => item.status !== "RESOLVIDO",
  ).length;
  const resolved = occurrences.filter(
    (item) => item.status === "RESOLVIDO",
  ).length;
  const updateOccurrence = (id: number, status: StatusOcorrencia) => {
    setOccurrences((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

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
      <section className="prefeitura-occurrences">
        <div className="prefeitura-occurrences-heading">
          <div>
            <h2>Relatos para atendimento</h2>
            <p>Atualize o andamento e responda aos cidadãos.</p>
          </div>
        </div>
        {loading && <p>Carregando relatos...</p>}
        {error && <p className="prefeitura-occurrence-error" role="alert">{error}</p>}
        {!loading && !error && occurrences.length === 0 && (
          <p>Ainda não há relatos cadastrados em Acopiara.</p>
        )}
        {occurrences.map((occurrence) => (
          <AtendimentoOcorrencia
            key={occurrence.id}
            occurrence={occurrence}
            onUpdated={updateOccurrence}
          />
        ))}
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
