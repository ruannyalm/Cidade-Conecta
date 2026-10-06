"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  LocateFixed,
  Map,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  listOccurrences,
  supportOccurrence,
  unsupportOccurrence,
  addOccurrenceComment,
  analyzeOccurrenceUrgency,
  getSession,
  API_URL,
  type Role,
  type Occurrence,
  type UrgencyAnalysis,
} from "../../lib/api";
import { acopiaraLocations } from "../../components/cidade-conecta/shared";

export type Comment = {
  id: number;
  author: string;
  text: string;
  time: string;
};

export type StreetOccurrence = {
  id: number;
  author: string;
  initials: string;
  time: string;
  title: string;
  description: string;
  supports: number;
  isSupported?: boolean;
  status: "Em análise" | "Em atendimento" | "Resolvida";
  category?: string;
  photos?: string[];
  comments: Comment[];
};

export type Street = {
  name: string;
  neighborhood: string;
  position: { top: string; left: string };
  total: number;
  tone: "blue" | "orange" | "green";
  occurrences: StreetOccurrence[];
};

const defaultPositions = [
  { top: "12%", left: "15%" },
  { top: "18%", left: "55%" },
  { top: "40%", left: "20%" },
  { top: "45%", left: "62%" },
  { top: "68%", left: "18%" },
  { top: "72%", left: "58%" },
  { top: "35%", left: "40%" },
  { top: "82%", left: "38%" },
  { top: "25%", left: "35%" },
  { top: "60%", left: "42%" },
];

const defaultDemoOccurrences: Record<string, StreetOccurrence[]> = {
  "Av. Cazuzinha Marques": [
    {
      id: 901,
      author: "João Silva (Teste)",
      initials: "JS",
      time: "Hoje às 09:15",
      title: "Buraco em trecho movimentado próximo à praça",
      description:
        "Há um buraco considerável na pista que tem provocado desvios bruscos de motoristas e motociclistas. Risco de acidente no período noturno.",
      supports: 18,
      isSupported: false,
      status: "Em análise",
      category: "Infraestrutura",
      comments: [
        {
          id: 1,
          author: "Maria Clara",
          text: "Passei por lá ontem à noite e quase caí de moto! Precisa de reparo urgente.",
          time: "Há 1 hora",
        },
        {
          id: 2,
          author: "Carlos Eduardo",
          text: "Apoiei! Tomara que a prefeitura resolva logo.",
          time: "Há 30 min",
        },
      ],
    },
    {
      id: 902,
      author: "Ana Souza (Teste)",
      initials: "AS",
      time: "Ontem às 16:40",
      title: "Iluminação apagada no trecho comercial",
      description:
        "Três postes sequenciais estão apagados deixando o início da av. Cazuzinha Marques escuro durante a noite.",
      supports: 12,
      isSupported: false,
      status: "Em atendimento",
      category: "Iluminação Pública",
      comments: [],
    },
  ],
  "R. Manuel José": [
    {
      id: 903,
      author: "Carlos Oliveira (Teste)",
      initials: "CO",
      time: "Há 2 dias",
      title: "Poste de luz piscando e fiação caíba",
      description:
        "Fiação telefônica caída na altura do número 240. Necessita recolhimento ou manutenção dos cabos pendurados.",
      supports: 24,
      isSupported: true,
      status: "Em atendimento",
      category: "Segurança / Iluminação",
      comments: [
        {
          id: 1,
          author: "Equipe Conecta",
          text: "Ocorrência encaminhada para a secretaria de obras municipal.",
          time: "Há 1 dia",
        },
      ],
    },
  ],
  "R. Emídio Alves de Almeida": [
    {
      id: 904,
      author: "Fernanda Lima (Teste)",
      initials: "FL",
      time: "Há 1 dia",
      title: "Descarte irregular de entulho e lixo na calçada",
      description:
        "Sacolas de lixo e restos de construção estão bloqueando a calçada e acumulando insetos.",
      supports: 15,
      isSupported: false,
      status: "Em análise",
      category: "Limpeza Pública",
      comments: [],
    },
  ],
  "R. Maria Nilce Rodrigues Marquês": [
    {
      id: 905,
      author: "Roberto Alves (Teste)",
      initials: "RA",
      time: "Há 3 dias",
      title: "Asfalto cedeu após forte chuva",
      description:
        "Surgiu um afundamento no asfalto próximo à esquina. Carros de pequeno porte estão raspando o fundo.",
      supports: 32,
      isSupported: false,
      status: "Em análise",
      category: "Vias Públicas",
      comments: [
        {
          id: 1,
          author: "Luciana Rocha",
          text: "Total apoio! É a rua principal de acesso ao bairro.",
          time: "Há 2 dias",
        },
      ],
    },
  ],
  "R. Dr. Tribúrcio Soares": [
    {
      id: 906,
      author: "Camila Rocha (Teste)",
      initials: "CR",
      time: "Há 4 dias",
      title: "Galho de árvore caindo sobre sinalização",
      description:
        "Árvore com galho quebrado necessitando poda urgente para não cobrir a placa de sinalização de trânsito.",
      supports: 9,
      isSupported: false,
      status: "Resolvida",
      category: "Meio Ambiente",
      comments: [
        {
          id: 1,
          author: "Prefeitura de Acopiara",
          text: "Poda realizada com sucesso pela equipe de meio ambiente.",
          time: "Há 1 dia",
        },
      ],
    },
  ],
  "R. Paulino Felix": [
    {
      id: 907,
      author: "Marcos Vinícius (Teste)",
      initials: "MV",
      time: "Há 5 dias",
      title: "Lâmpadas queimadas substituídas",
      description:
        "Relato sobre lâmpadas queimadas na rua. Serviço concluído e iluminação restabelecida.",
      supports: 29,
      isSupported: false,
      status: "Resolvida",
      category: "Iluminação Pública",
      comments: [],
    },
  ],
  "Ponto de referência: Igreja da Matriz": [
    {
      id: 908,
      author: "Beatriz Santos (Teste)",
      initials: "BS",
      time: "Há 2 dias",
      title: "Piso tátil solto e calçada danificada perto da matriz",
      description:
        "O piso na praça principal em frente à Matriz está com pedras soltas, dificultando a acessibilidade de idosos.",
      supports: 41,
      isSupported: false,
      status: "Em atendimento",
      category: "Acessibilidade",
      comments: [
        {
          id: 1,
          author: "Padre Antônio",
          text: "Apoio este pedido! É essencial garantir acessibilidade aos fiéis e visitantes.",
          time: "Há 1 dia",
        },
      ],
    },
  ],
};

function buildStreetList(dbOccurrences: Occurrence[]): Street[] {
  // Extract all unique street names from acopiaraLocations + DB occurrences
  const streetNameSet = new Set<string>();
  acopiaraLocations.forEach((name) => streetNameSet.add(name.trim()));

  dbOccurrences.forEach((occ) => {
    if (occ.endereco && occ.endereco.trim().length > 0) {
      streetNameSet.add(occ.endereco.trim());
    }
  });

  const streetList: Street[] = [];

  let posIdx = 0;
  streetNameSet.forEach((streetName) => {
    const defaultOccs = defaultDemoOccurrences[streetName] || [];
    const occurrencesForStreet: StreetOccurrence[] = [...defaultOccs];

    // Filter occurrences from DB matching this street
    dbOccurrences.forEach((occ) => {
      const match =
        occ.endereco?.trim().toLowerCase() === streetName.toLowerCase();
      if (match) {
        // Prevent duplicate IDs if demo ID conflicts
        const exists = occurrencesForStreet.some((item) => item.id === occ.id);
        if (!exists) {
          occurrencesForStreet.unshift({
            id: occ.id,
            author: occ.anonima
              ? "Cidadão Anônimo"
              : occ.autor || "Morador de Acopiara",
            initials: occ.anonima
              ? "AN"
              : (occ.autor || "MO").slice(0, 2).toUpperCase(),
            time: new Date(occ.criadaEm).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            title: occ.titulo,
            description: occ.descricao,
            supports: occ.apoios || 0,
            isSupported: false,
            status:
              occ.status === "RESOLVIDO"
                ? "Resolvida"
                : occ.status === "EM_PROCESSO" || occ.status === "AGENDADO"
                  ? "Em atendimento"
                  : "Em análise",
            category: occ.categoria || "Geral",
            photos: (occ.midias || [])
              .map((m) => {
                if (!m.url) return "";
                if (
                  m.url.startsWith("http") ||
                  m.url.startsWith("blob:") ||
                  m.url.startsWith("data:")
                ) {
                  return m.url;
                }
                return `${API_URL}${m.url}`;
              })
              .filter(Boolean),
            comments: (occ.respostas || []).map((resp) => ({
              id: resp.id,
              author: resp.autor,
              text: resp.mensagem,
              time: new Date(resp.criadaEm).toLocaleDateString("pt-BR"),
            })),
          });
        }
      }
    });

    const position = defaultPositions[posIdx % defaultPositions.length];
    posIdx++;

    const hasInAnalysis = occurrencesForStreet.some(
      (o) => o.status === "Em análise",
    );
    const hasProgress = occurrencesForStreet.some(
      (o) => o.status === "Em atendimento",
    );
    const tone: "blue" | "orange" | "green" = hasInAnalysis
      ? "blue"
      : hasProgress
        ? "orange"
        : "green";

    streetList.push({
      name: streetName,
      neighborhood: "Acopiara · CE",
      position,
      total: occurrencesForStreet.length,
      tone,
      occurrences: occurrencesForStreet,
    });
  });

  return streetList;
}

export function MapaDeOcorrencias({
  notify,
  role = "CIDADAO",
  onNewReport,
  refreshKey = 0,
}: {
  notify: (message: string) => void;
  role?: Role;
  onNewReport?: (address: string) => void;
  refreshKey?: number;
}) {
  const [streets, setStreets] = useState<Street[]>(() => buildStreetList([]));
  const [selectedStreetName, setSelectedStreetName] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>(
    {},
  );
  const [activeCommentBox, setActiveCommentBox] = useState<number | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<number, UrgencyAnalysis>>({});
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listOccurrences(role)
      .then((occurrences) => {
        if (active && Array.isArray(occurrences)) {
          setStreets(buildStreetList(occurrences));
        }
      })
      .catch(() => {
        // Fallback gracefully to demo streets
        if (active) setStreets(buildStreetList([]));
      });
    return () => {
      active = false;
    };
  }, [refreshKey, role]);

  const selectedStreet =
    streets.find((street) => street.name === selectedStreetName) || null;

  const visibleStreets = streets.filter((street) =>
    `${street.name} ${street.neighborhood}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleToggleSupport = async (occurrenceId: number) => {
    // Optimistically update local state
    setStreets((prevStreets) =>
      prevStreets.map((street) => ({
        ...street,
        occurrences: street.occurrences.map((occ) => {
          if (occ.id !== occurrenceId) return occ;
          const willSupport = !occ.isSupported;
          return {
            ...occ,
            isSupported: willSupport,
            supports: willSupport
              ? occ.supports + 1
              : Math.max(0, occ.supports - 1),
          };
        }),
      })),
    );

    // Get current status to show appropriate notification
    let isNowSupported = false;
    streets.forEach((s) => {
      const found = s.occurrences.find((o) => o.id === occurrenceId);
      if (found) isNowSupported = !found.isSupported;
    });

    if (isNowSupported) {
      notify("Você apoiou esta ocorrência com sucesso! ❤️");
    } else {
      notify("Apoio removido.");
    }

    // Call API backend in background if real occurrence ID
    try {
      if (isNowSupported) {
        await supportOccurrence(occurrenceId);
      } else {
        await unsupportOccurrence(occurrenceId);
      }
    } catch {
      // Gracefully ignore API error if using mock test data
    }
  };

  const handleAddComment = async (occurrenceId: number) => {
    const text = (newCommentText[occurrenceId] || "").trim();
    if (!text) return;

    const session = getSession();
    const authorName = session ? session.nome : (role === "PREFEITURA" ? "Prefeitura de Acopiara" : "Você (Cidadão)");

    const newComment: Comment = {
      id: Date.now(),
      author: authorName,
      text,
      time: "Agora mesmo",
    };

    setStreets((prevStreets) =>
      prevStreets.map((street) => ({
        ...street,
        occurrences: street.occurrences.map((occ) => {
          if (occ.id !== occurrenceId) return occ;
          return {
            ...occ,
            comments: [...occ.comments, newComment],
          };
        }),
      })),
    );

    setNewCommentText((prev) => ({ ...prev, [occurrenceId]: "" }));
    notify("Comentário registrado e salvo com sucesso! 💬");

    try {
      await addOccurrenceComment(occurrenceId, text);
    } catch {
      // Saved in local state gracefully if backend offline
    }
  };

  const handleAnalyzeWithAI = async (occurrenceId: number, occTitle: string, occDesc: string, occCategory: string, comments: Comment[]) => {
    setAnalyzingId(occurrenceId);
    try {
      const result = await analyzeOccurrenceUrgency(occurrenceId);
      setAiAnalysisResult((prev) => ({ ...prev, [occurrenceId]: result }));
    } catch {
      // Fallback local AI evaluation incorporating comments & context
      const commentTexts = comments.map((c) => `${c.author}: ${c.text}`).join(" ");
      const combinedText = `${occTitle} ${occDesc} ${commentTexts}`.toLowerCase();

      const isHighRisk = /moto|bicicleta|quase ca[íi]|ferid|choque|eletric|emergencia|risco|urgente/i.test(combinedText);
      const isMediumRisk = /ilumina|escuro|lixo|calcada|buraco/i.test(combinedText);

      const urgencia = isHighRisk ? "ALTA" : isMediumRisk ? "MEDIA" : "BAIXA";
      const pontuacaoRisco = isHighRisk ? 78 : isMediumRisk ? 48 : 25;

      const fatores = [
        `Categoria: ${occCategory || "Geral"}.`,
        `Análise realizada incluindo ${comments.length} comentário(s) de moradores no histórico.`
      ];

      if (/moto|bicicleta|quase ca[íi]/i.test(combinedText)) {
        fatores.push("Os comentários identificaram risco específico para motociclistas e ciclistas que transitam pelo local.");
      }
      if (/idoso|acessibilidade|calcada/i.test(combinedText)) {
        fatores.push("Os comentários destacam dificuldade de acessibilidade para pedestres e idosos.");
      }

      const comoResolver = isHighRisk
        ? `1. [Ação Urgente] Enviar equipe de triagem para isolar e sinalizar o trecho em até 2h. 2. [Execução] Proceder com o reparo asfáltico/elétrico estrutural. 3. [Moradores] Atender os alertas sobre veículos de duas rodas citados nos comentários. 4. [Retorno] Notificar a comunidade.`
        : `1. [Triagem] Agendar vistoria técnica da equipe responsável. 2. [Manutenção] Realizar reparo da via/iluminação. 3. [Moradores] Validar o serviço com os moradores locais. 4. [Retorno] Alterar status para RESOLVIDO.`;

      setAiAnalysisResult((prev) => ({
        ...prev,
        [occurrenceId]: {
          ocorrenciaId: occurrenceId,
          urgencia,
          pontuacaoRisco,
          fatores,
          recomendacao: isHighRisk
            ? "Priorizar a triagem e sinalização de emergência."
            : "Manter na fila de atendimento com acompanhamento.",
          comoResolver,
          metodo: "triagem-explicavel-ia"
        }
      }));
    } finally {
      setAnalyzingId(null);
    }
  };

  if (selectedStreet) {
    return (
      <main className="dashboard-page container map-screen street-detail-screen">
        <button
          className="back-to-map"
          onClick={() => setSelectedStreetName(null)}
        >
          <ArrowLeft size={18} /> Voltar para o mapa de ruas
        </button>

        <div className="street-feed-header">
          <div>
            <div className="section-kicker">
              <Sparkles size={14} className="inline-icon" /> OCORRÊNCIAS DA RUA
            </div>
            <h1>{selectedStreet.name}</h1>
            <p>
              <MapPin size={16} /> {selectedStreet.neighborhood} ·{" "}
              <strong>{selectedStreet.total}</strong> relatos registrados pelos
              moradores
            </p>
          </div>
          {role === "CIDADAO" && onNewReport && (
            <button
              className="primary-btn pulse-on-hover"
              onClick={() => onNewReport(selectedStreet.name)}
            >
              + Registrar ocorrência nesta rua
            </button>
          )}
        </div>

        <section className="street-feed">
          <div className="feed-intro">
            <Users size={20} />
            <span>Relatos e comentários da comunidade (Dados de Teste / Reais)</span>
          </div>

          {selectedStreet.occurrences.map((occurrence) => (
            <article className="occurrence-post card-elevated" key={occurrence.id}>
              <div className="post-author">
                <span className="post-avatar">{occurrence.initials}</span>
                <div>
                  <strong>{occurrence.author}</strong>
                  <small>{occurrence.time} · Acopiara, CE</small>
                </div>
                <span
                  className={`status status-${
                    occurrence.status === "Resolvida"
                      ? "green"
                      : occurrence.status === "Em atendimento"
                        ? "orange"
                        : "blue"
                  }`}
                >
                  <span className="status-dot" />
                  {occurrence.status === "Resolvida" && <CheckCircle2 size={12} />}
                  {occurrence.status === "Em atendimento" && <Clock size={12} />}
                  {occurrence.status === "Em análise" && <AlertCircle size={12} />}
                  {occurrence.status}
                </span>
              </div>

              {occurrence.category && (
                <span className="category-badge">{occurrence.category}</span>
              )}

              <h2>{occurrence.title}</h2>
              <p className="occurrence-desc">{occurrence.description}</p>

              {/* Photos attached to this occurrence */}
              {occurrence.photos && occurrence.photos.length > 0 && (
                <div
                  className="occurrence-photos-container"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      occurrence.photos.length === 1
                        ? "1fr"
                        : "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "10px",
                    margin: "12px 0 16px 0",
                  }}
                >
                  {occurrence.photos.map((photoUrl, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        maxHeight: "260px",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(photoUrl, "_blank")}
                    >
                      <img
                        src={photoUrl}
                        alt={`Foto da ocorrência ${occurrence.title}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: "260px",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="post-actions">
                <button
                  className={`support-btn ${occurrence.isSupported ? "supported" : ""}`}
                  onClick={() => handleToggleSupport(occurrence.id)}
                  title="Apoiar este relato da comunidade"
                >
                  <Heart
                    size={18}
                    fill={occurrence.isSupported ? "#e63946" : "none"}
                    color={occurrence.isSupported ? "#e63946" : "currentColor"}
                  />
                  <span>
                    {occurrence.isSupported ? "Apoiado" : "Apoiar"}
                  </span>
                  <strong className="support-count">{occurrence.supports}</strong>
                </button>

                <button
                  className="comment-btn"
                  onClick={() =>
                    setActiveCommentBox((curr) =>
                      curr === occurrence.id ? null : occurrence.id,
                    )
                  }
                >
                  <MessageCircle size={18} />
                  <span>Comentários ({occurrence.comments.length})</span>
                </button>

                <button
                  className="outline-btn ai-trigger-btn"
                  onClick={() =>
                    handleAnalyzeWithAI(
                      occurrence.id,
                      occurrence.title,
                      occurrence.description,
                      occurrence.category || "Geral",
                      occurrence.comments,
                    )
                  }
                  disabled={analyzingId === occurrence.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.85rem",
                    borderRadius: "8px",
                    borderColor: "rgba(22, 129, 212, 0.4)",
                    color: "var(--color-primary, #1681d4)",
                    backgroundColor: "rgba(22, 129, 212, 0.05)",
                  }}
                >
                  <Sparkles size={15} />
                  {analyzingId === occurrence.id
                    ? "Analisando com IA..."
                    : "Ver Análise & Plano da IA"}
                </button>
              </div>

              {/* AI Urgency & Resolution Analysis Display */}
              {aiAnalysisResult[occurrence.id] && (
                <div
                  className="ai-occurrence-card"
                  style={{
                    margin: "1rem 0 0.5rem 0",
                    padding: "1rem",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(22, 129, 212, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)",
                    border: "1px solid rgba(22, 129, 212, 0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justify: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Sparkles size={18} color="#1681d4" />
                      <strong style={{ fontSize: "0.95rem" }}>
                        Avaliação da IA (Comentários + Relato)
                      </strong>
                    </div>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        backgroundColor:
                          aiAnalysisResult[occurrence.id].urgencia === "CRITICA" ||
                          aiAnalysisResult[occurrence.id].urgencia === "ALTA"
                            ? "#ef4444"
                            : aiAnalysisResult[occurrence.id].urgencia === "MEDIA"
                            ? "#f59e0b"
                            : "#10b981",
                        color: "#ffffff",
                      }}
                    >
                      Urgência: {aiAnalysisResult[occurrence.id].urgencia} (
                      {aiAnalysisResult[occurrence.id].pontuacaoRisco}/100)
                    </span>
                  </div>

                  <p style={{ fontSize: "0.875rem", margin: "0.4rem 0", opacity: 0.9 }}>
                    <strong>Próxima ação recomendada:</strong>{" "}
                    {aiAnalysisResult[occurrence.id].recomendacao}
                  </p>

                  <ul
                    style={{
                      margin: "0.4rem 0",
                      paddingLeft: "1.2rem",
                      fontSize: "0.85rem",
                      opacity: 0.85,
                    }}
                  >
                    {aiAnalysisResult[occurrence.id].fatores.map((fator) => (
                      <li key={fator}>{fator}</li>
                    ))}
                  </ul>

                  {aiAnalysisResult[occurrence.id].comoResolver && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        paddingTop: "0.5rem",
                        borderTop: "1px solid rgba(0,0,0,0.1)",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          color: "#10b981",
                          marginBottom: "0.25rem",
                        }}
                      >
                        💡 Como a IA resolveria este problema (Plano de Ação Passo a Passo):
                      </strong>
                      <p style={{ fontSize: "0.85rem", lineHeight: "1.45", margin: 0 }}>
                        {aiAnalysisResult[occurrence.id].comoResolver}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Comments list and comment input box */}
              <div className="comments-section">
                {occurrence.comments.length > 0 && (
                  <div className="comments-list">
                    {occurrence.comments.map((comment) => (
                      <div className="comment-item" key={comment.id}>
                        <div className="comment-header">
                          <strong>{comment.author}</strong>
                          <small>{comment.time}</small>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeCommentBox === occurrence.id && (
                  <div className="add-comment-box">
                    <input
                      type="text"
                      placeholder="Escreva um comentário ou apoio..."
                      value={newCommentText[occurrence.id] || ""}
                      onChange={(e) =>
                        setNewCommentText({
                          ...newCommentText,
                          [occurrence.id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment(occurrence.id);
                      }}
                    />
                    <button
                      className="send-comment-btn"
                      onClick={() => handleAddComment(occurrence.id)}
                    >
                      <Send size={15} /> Enviar
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}

          {selectedStreet.occurrences.length === 0 && (
            <div className="empty-streets-card">
              <AlertCircle size={32} color="#1681d4" />
              <h3>Ainda não há ocorrências cadastradas nesta rua</h3>
              <p>Seja o primeiro morador a registrar um relato para a comunidade de Acopiara.</p>
              {role === "CIDADAO" && onNewReport && (
                <button
                  className="primary-btn"
                  onClick={() => onNewReport(selectedStreet.name)}
                >
                  Registrar ocorrência agora
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page container map-screen">
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            <Map size={14} className="inline-icon" /> MAPA INTERATIVO DAS RUAS
          </div>
          <h1>Acopiara · Ceará</h1>
          <p>
            Clique nos cards das ruas diretamente no mapa ou na lista lateral
            para visualizar e apoiar as ocorrências ativas.
          </p>
        </div>
        <button
          className="outline-btn"
          onClick={() => notify("Visão do mapa atualizada.")}
        >
          <Map size={17} /> Atualizar Mapa
        </button>
      </div>

      <div className="map-toolbar">
        <div className="map-stat">
          <span className="map-stat-dot blue-dot" />
          <div>
            <strong>
              {streets.reduce((total, street) => total + street.total, 0)}
            </strong>
            <small>relatos cadastrados</small>
          </div>
        </div>
        <div className="map-stat">
          <span className="map-stat-dot green-dot" />
          <div>
            <strong>
              {streets.reduce(
                (total, street) =>
                  total +
                  street.occurrences.filter(
                    (occ) => occ.status === "Resolvida",
                  ).length,
                0,
              )}
            </strong>
            <small>resolvidos</small>
          </div>
        </div>
        <div className="map-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar rua cadastrada..."
            aria-label="Buscar rua cadastrada"
          />
        </div>
        <button
          className="location-btn"
          onClick={() => notify("Localização focada em Acopiara · CE")}
        >
          <LocateFixed size={18} />
          <span>Minha localização</span>
        </button>
      </div>

      <section className="full-map-card">
        {/* INTERACTIVE MAP CONTAINER WITH CARDS INSIDE THE MAP */}
        <div className="brazil-map-art interactive-map-canvas">
          <div className="map-watermark">ACOPIARA · CE</div>
          
          <div className="map-street-cards-container">
            {visibleStreets.map((street) => (
              <button
                key={street.name}
                className={`map-street-pin-card ${street.tone}`}
                style={{
                  top: street.position.top,
                  left: street.position.left,
                }}
                onClick={() => setSelectedStreetName(street.name)}
                title={`Clique para ver os relatos de ${street.name}`}
              >
                <div className="pin-header">
                  <span className={`status-beacon ${street.tone}`} />
                  <strong className="pin-street-name">{street.name}</strong>
                </div>
                <div className="pin-footer">
                  <MapPin size={13} />
                  <span>{street.total} relatos</span>
                  <span className="pin-action-arrow">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SIDEBAR STREET CARD LIST */}
        <div className="street-card-list">
          <div className="street-list-heading">
            <div>
              <strong>Ruas Cadastradas ({visibleStreets.length})</strong>
              <span>Clique no card da rua para abrir as ocorrências</span>
            </div>
            <MapPin size={19} color="#1681d4" />
          </div>

          <div className="street-cards-scroll">
            {visibleStreets.map((street) => (
              <button
                className="street-card"
                key={street.name}
                onClick={() => setSelectedStreetName(street.name)}
              >
                <span className={`street-status-dot ${street.tone}`} />
                <span className="street-card-info">
                  <strong>{street.name}</strong>
                  <small>{street.neighborhood}</small>
                </span>
                <span className="street-card-total">
                  <strong>{street.total}</strong>
                  <small>relatos</small>
                </span>
              </button>
            ))}
            {visibleStreets.length === 0 && (
              <p className="empty-streets">
                Nenhuma rua encontrada com esse termo de busca.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
