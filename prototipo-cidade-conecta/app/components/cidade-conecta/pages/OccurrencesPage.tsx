"use client";

import {
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  Plus,
  Search,
  Volume2,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { listMyOccurrences, type Occurrence } from "../../../lib/api";
import { Status } from "../shared";

export function OccurrencesPage({
  onNewReport,
  notify,
}: {
  onNewReport: () => void;
  notify: (message: string) => void;
}) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyOccurrences()
      .then(setOccurrences)
      .catch(() => notify("Não foi possível carregar suas ocorrências."))
      .finally(() => setLoading(false));
  }, [notify]);

  const inProgress = occurrences.filter(
    (item) => item.status !== "RESOLVIDO",
  ).length;
  const resolved = occurrences.filter(
    (item) => item.status === "RESOLVIDO",
  ).length;

  const statusLabel = (status: Occurrence["status"]) => {
    if (status === "RESOLVIDO") return { label: "Resolvida", color: "green" };
    if (status === "EM_PROCESSO")
      return { label: "Em atendimento", color: "orange" };
    return { label: "Em análise", color: "blue" };
  };

  return (
    <main className="dashboard-page container">
      <div className="page-heading">
        <div>
          <div className="section-kicker">ÁREA DO CIDADÃO</div>
          <h1>Minhas ocorrências</h1>
          <p>Acompanhe o andamento das suas solicitações.</p>
        </div>
        <button className="primary-btn" onClick={() => onNewReport()}>
          <Plus size={18} /> Nova ocorrência
        </button>
      </div>
      <div className="summary-row">
        <div className="summary-card">
          <span className="summary-icon blue-bg">
            <FileText size={19} />
          </span>
          <div>
            <small>Total registradas</small>
            <strong>{loading ? "-" : occurrences.length}</strong>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon yellow-bg">
            <Clock3 size={19} />
          </span>
          <div>
            <small>Em andamento</small>
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
      <div className="list-card">
        <div className="list-toolbar">
          <h2>Histórico recente</h2>
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Buscar ocorrência" />
          </div>
        </div>
        {!loading && occurrences.length === 0 && (
          <p className="empty-streets">Você ainda não registrou ocorrências.</p>
        )}
        {occurrences.map((occurrence) => {
          const status = statusLabel(occurrence.status);
          return (
            <div className="list-row" key={occurrence.id}>
              <span className="problem-icon">
                {occurrence.urgencia === "CRITICA" ||
                occurrence.urgencia === "ALTA"
                  ? "⚠️"
                  : "📍"}
              </span>
              <div className="list-main">
                <strong>{occurrence.titulo}</strong>
                <span>
                  <MapPin size={13} />
                  {occurrence.bairro ||
                    occurrence.endereco ||
                    "Local não informado"}{" "}
                  · {new Date(occurrence.criadaEm).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <Status color={status.color}>{status.label}</Status>
              <button
                className="listen-status"
                onClick={() =>
                  notify(`Sua ocorrência está ${status.label.toLowerCase()}.`)
                }
              >
                <Volume2 size={15} /> Ouvir status
              </button>
              <ChevronRight size={18} className="row-arrow" />
            </div>
          );
        })}
      </div>
    </main>
  );
}
