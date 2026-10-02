"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Heart,
  LocateFixed,
  Map,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { listOccurrences, type Role, type Occurrence } from "../../lib/api";

type StreetOccurrence = {
  id: number;
  author: string;
  initials: string;
  time: string;
  title: string;
  description: string;
  supports: number;
  status: "Em análise" | "Em atendimento" | "Resolvida";
};
type Street = {
  name: string;
  neighborhood: string;
  position: string;
  total: number;
  tone: "red" | "yellow" | "green";
  occurrences: StreetOccurrence[];
};

const initialStreets: Street[] = [
  {
    name: "Rua das Palmeiras",
    neighborhood: "Jardim América",
    position: "north",
    total: 8,
    tone: "red",
    occurrences: [
      {
        id: 1,
        author: "Lucas Mendes",
        initials: "LM",
        time: "há 18 min",
        title: "Buraco ocupando metade da faixa",
        description:
          "O buraco aumentou depois da última chuva e está difícil passar de bicicleta ou de carro.",
        supports: 24,
        status: "Em atendimento",
      },
      {
        id: 2,
        author: "Beatriz Lima",
        initials: "BL",
        time: "há 2 h",
        title: "Iluminação apagada perto da praça",
        description:
          "Três postes estão sem luz desde ontem. A rua fica muito escura à noite.",
        supports: 11,
        status: "Em análise",
      },
    ],
  },
  {
    name: "Avenida Central",
    neighborhood: "Centro",
    position: "midwest",
    total: 14,
    tone: "yellow",
    occurrences: [
      {
        id: 3,
        author: "Rafael Souza",
        initials: "RS",
        time: "há 42 min",
        title: "Semáforo desregulado",
        description:
          "O sinal abre por poucos segundos e causa uma fila grande nos horários de pico.",
        supports: 31,
        status: "Em atendimento",
      },
    ],
  },
  {
    name: "Rua do Bosque",
    neighborhood: "Vila Nova",
    position: "northeast",
    total: 5,
    tone: "green",
    occurrences: [
      {
        id: 4,
        author: "Carolina Alves",
        initials: "CA",
        time: "ontem",
        title: "Calçada com descarte irregular",
        description:
          "Há sacos e móveis bloqueando a passagem de pedestres perto do ponto de ônibus.",
        supports: 8,
        status: "Resolvida",
      },
    ],
  },
  {
    name: "Rua do Mercado",
    neighborhood: "Moema",
    position: "southeast",
    total: 9,
    tone: "red",
    occurrences: [
      {
        id: 5,
        author: "João Pedro",
        initials: "JP",
        time: "há 3 h",
        title: "Vazamento de água na calçada",
        description:
          "A água está escorrendo pela calçada e deixando o piso escorregadio.",
        supports: 17,
        status: "Em análise",
      },
    ],
  },
  {
    name: "Avenida das Flores",
    neighborhood: "Ipiranga",
    position: "south",
    total: 3,
    tone: "green",
    occurrences: [
      {
        id: 6,
        author: "Marina Costa",
        initials: "MC",
        time: "12 jun",
        title: "Ponto de ônibus sem cobertura",
        description:
          "O ponto atende muitos moradores, mas não tem cobertura para dias de chuva.",
        supports: 6,
        status: "Resolvida",
      },
    ],
  },
];

function toStreetData(occurrences: Occurrence[]): Street[] {
  const positions = ["north", "midwest", "northeast", "southeast", "south"];
  const grouped = new globalThis.Map<string, Street>();
  occurrences.forEach((occurrence, index) => {
    const name =
      occurrence.endereco || occurrence.bairro || "Local não informado";
    const existing = grouped.get(name);
    const status =
      occurrence.status === "RESOLVIDO"
        ? "Resolvida"
        : occurrence.status === "EM_PROCESSO"
          ? "Em atendimento"
          : "Em análise";
    const tone =
      occurrence.urgencia === "ALTA" || occurrence.urgencia === "CRITICA"
        ? "red"
        : occurrence.urgencia === "MEDIA"
          ? "yellow"
          : "green";
    const item: StreetOccurrence = {
      id: occurrence.id,
      author: occurrence.anonima
        ? "Relato anônimo"
        : occurrence.autor || "Morador",
      initials: occurrence.anonima
        ? "AN"
        : (occurrence.autor || "MO").slice(0, 2).toUpperCase(),
      time: new Date(occurrence.criadaEm).toLocaleDateString("pt-BR"),
      title: occurrence.titulo,
      description: occurrence.descricao,
      supports: occurrence.apoios,
      status,
    };
    if (existing) {
      existing.total += 1;
      existing.occurrences.push(item);
    } else {
      grouped.set(name, {
        name,
        neighborhood: occurrence.bairro || "Bairro não informado",
        position: positions[index % positions.length],
        total: 1,
        tone,
        occurrences: [item],
      });
    }
  });
  return [...grouped.values()];
}

export function MapaDeOcorrencias({
  notify,
  role = "CIDADAO",
}: {
  notify: (message: string) => void;
  role?: Role;
}) {
  const [streets, setStreets] = useState(initialStreets);
  const [selectedStreetName, setSelectedStreetName] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    let active = true;
    listOccurrences(role)
      .then((occurrences) => {
        if (active) setStreets(toStreetData(occurrences));
      })
      .catch(() => notify("Não foi possível carregar as ocorrências da API."));
    return () => {
      active = false;
    };
  }, [notify, role]);
  const selectedStreet =
    streets.find((street) => street.name === selectedStreetName) || null;
  const visibleStreets = streets.filter((street) =>
    `${street.name} ${street.neighborhood}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const submitOccurrence = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStreet || !newTitle.trim() || !newDescription.trim()) return;
    const occurrence: StreetOccurrence = {
      id: Date.now(),
      author: "Ana Souza",
      initials: "AS",
      time: "agora",
      title: newTitle.trim(),
      description: newDescription.trim(),
      supports: 0,
      status: "Em análise",
    };
    setStreets((current) =>
      current.map((street) =>
        street.name === selectedStreet.name
          ? {
              ...street,
              total: street.total + 1,
              occurrences: [occurrence, ...street.occurrences],
            }
          : street,
      ),
    );
    setNewTitle("");
    setNewDescription("");
    setFormOpen(false);
    notify(`Ocorrência criada em ${selectedStreet.name}`);
  };

  if (selectedStreet)
    return (
      <main className="dashboard-page container map-screen street-detail-screen">
        <button
          className="back-to-map"
          onClick={() => setSelectedStreetName(null)}
        >
          <ArrowLeft size={17} /> Voltar para o mapa
        </button>
        <div className="street-feed-header">
          <div>
            <div className="section-kicker">OCORRÊNCIAS DA RUA</div>
            <h1>{selectedStreet.name}</h1>
            <p>
              <MapPin size={15} /> {selectedStreet.neighborhood} ·{" "}
              {selectedStreet.total} relatos da comunidade
            </p>
          </div>
          {role === "CIDADAO" && (
            <button className="primary-btn" onClick={() => setFormOpen(true)}>
              <Plus size={18} /> Criar ocorrência
            </button>
          )}
        </div>
        {formOpen && (
          <form className="new-occurrence-form" onSubmit={submitOccurrence}>
            <div className="form-heading">
              <div>
                <strong>Nova ocorrência</strong>
                <span>
                  Este relato será publicado em {selectedStreet.name}.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Fechar formulário"
              >
                <X size={18} />
              </button>
            </div>
            <label htmlFor="street-occurrence-title">Título do problema</label>
            <input
              id="street-occurrence-title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Ex.: Buraco perto da faixa de pedestres"
              required
            />
            <label htmlFor="street-occurrence-description">
              Conte o que aconteceu
            </label>
            <textarea
              id="street-occurrence-description"
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Descreva o problema para os outros moradores..."
              rows={4}
              required
            />
            <button className="primary-btn" type="submit">
              <Send size={17} /> Publicar ocorrência
            </button>
          </form>
        )}
        <section className="street-feed">
          <div className="feed-intro">
            <Users size={19} />
            <span>O que a comunidade está falando</span>
          </div>
          {selectedStreet.occurrences.map((occurrence) => (
            <article className="occurrence-post" key={occurrence.id}>
              <div className="post-author">
                <span className="post-avatar">{occurrence.initials}</span>
                <div>
                  <strong>{occurrence.author}</strong>
                  <small>{occurrence.time} · morador da região</small>
                </div>
                <span
                  className={`status status-${occurrence.status === "Resolvida" ? "green" : occurrence.status === "Em atendimento" ? "orange" : "blue"}`}
                >
                  <span className="status-dot" />
                  {occurrence.status}
                </span>
              </div>
              <h2>{occurrence.title}</h2>
              <p>{occurrence.description}</p>
              <div className="post-actions">
                <button onClick={() => notify("Você apoiou esta ocorrência")}>
                  <Heart size={17} /> Apoiar{" "}
                  <strong>{occurrence.supports}</strong>
                </button>
                <button
                  onClick={() => notify("Comentários disponíveis em breve")}
                >
                  <MessageCircle size={17} /> Comentar
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    );

  return (
    <main className="dashboard-page container map-screen">
      <div className="page-heading">
        <div>
          <div className="section-kicker">VISÃO DA CIDADE</div>
          <h1>Mapa de ocorrências</h1>
          <p>Escolha uma rua para ver os relatos da comunidade e participar.</p>
        </div>
        <button
          className="outline-btn"
          onClick={() => notify("Filtros do mapa atualizados")}
        >
          <Map size={17} /> Filtrar mapa
        </button>
      </div>
      <div className="map-toolbar">
        <div className="map-stat">
          <span className="map-stat-dot blue-dot" />
          <div>
            <strong>1.248</strong>
            <small>ocorrências no Brasil</small>
          </div>
        </div>
        <div className="map-stat">
          <span className="map-stat-dot green-dot" />
          <div>
            <strong>823</strong>
            <small>resolvidas</small>
          </div>
        </div>
        <div className="map-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar rua ou bairro"
            aria-label="Buscar rua ou bairro"
          />
        </div>
        <button
          className="location-btn"
          onClick={() => notify("Localização centralizada em São Paulo")}
        >
          <LocateFixed size={18} />
          <span>Minha localização</span>
        </button>
      </div>
      <section className="full-map-card">
        <div className="brazil-map-art">
          <div className="map-watermark">SÃO PAULO</div>
          {visibleStreets.map((street) => (
            <button
              key={street.name}
              className={`map-region ${street.position} ${street.tone}`}
              onClick={() => setSelectedStreetName(street.name)}
            >
              <span>{street.name}</span>
              <small>{street.total} relatos</small>
            </button>
          ))}
        </div>
        <div className="street-card-list">
          <div className="street-list-heading">
            <div>
              <strong>Ruas com ocorrências</strong>
              <span>Clique em um card para abrir o feed da rua.</span>
            </div>
            <MapPin size={19} />
          </div>
          {visibleStreets.map((street) => (
            <button
              className="street-card"
              key={street.name}
              onClick={() => setSelectedStreetName(street.name)}
            >
              <span className={`street-status-dot ${street.tone}`} />
              <span>
                <strong>{street.name}</strong>
                <small>{street.neighborhood}</small>
              </span>
              <span className="street-card-total">
                {street.total}
                <small>relatos</small>
              </span>
            </button>
          ))}
          {visibleStreets.length === 0 && (
            <p className="empty-streets">Nenhuma rua encontrada.</p>
          )}
        </div>
      </section>
    </main>
  );
}
