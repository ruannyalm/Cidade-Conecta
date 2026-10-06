const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";
console.log("API_URL:", API_URL);

export type Role = "CIDADAO" | "PREFEITURA";
export type StatusOcorrencia =
  | "EM_ANALISE"
  | "AGENDADO"
  | "EM_PROCESSO"
  | "RESOLVIDO";
export type NivelUrgencia = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export type UrgencyAnalysis = {
  ocorrenciaId: number;
  urgencia: NivelUrgencia;
  pontuacaoRisco: number;
  fatores: string[];
  recomendacao: string;
  metodo: string;
};

export type UserSession = {
  token: string;
  nome: string;
  email: string;
  role: Role;
};

export type Occurrence = {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  endereco: string | null;
  bairro: string | null;
  latitude: number | null;
  longitude: number | null;
  anonima: boolean;
  autor: string | null;
  status: StatusOcorrencia;
  urgencia: NivelUrgencia | null;
  apoios: number;
  acompanhada: boolean;
  enviadaPorAudio: boolean;
  criadaEm: string;
};

export type CreateOccurrenceInput = {
  titulo: string;
  descricao: string;
  categoria: string;
  endereco?: string;
  bairro?: string;
  anonima: boolean;
  enviadaPorAudio: boolean;
};

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("cidade-conecta-token");
}

export function saveSession(session: UserSession) {
  window.localStorage.setItem(
    "cidade-conecta-session",
    JSON.stringify(session),
  );
  window.localStorage.setItem("cidade-conecta-token", session.token);
}

export function getSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("cidade-conecta-session");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem("cidade-conecta-session");
  window.localStorage.removeItem("cidade-conecta-token");
}

async function request<T>(path: string, init: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erro ${response.status} ao acessar a API.`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function login(email: string, senha: string) {
  return request<UserSession>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
}

export function registerCitizen(nome: string, email: string, senha: string) {
  return request<{ mensagem: string }>("/auth/cadastro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
}

export function createOccurrence(input: CreateOccurrenceInput, media: File[]) {
  const formData = new FormData();
  formData.append(
    "dados",
    new Blob([JSON.stringify(input)], { type: "application/json" }),
  );
  media.forEach((file) => formData.append("midias", file));
  return request<Occurrence>("/api/ocorrencias", {
    method: "POST",
    body: formData,
  });
}

export function logout() {
  return request<void>("/auth/logout", { method: "POST" });
}

export function listOccurrences(role: Role) {
  const path =
    role === "PREFEITURA" ? "/api/prefeitura/ocorrencias" : "/api/ocorrencias";
  return request<Occurrence[]>(path);
}

export function analyzeOccurrenceUrgency(id: number) {
  return request<UrgencyAnalysis>(
    `/api/prefeitura/ocorrencias/${id}/analisar-urgencia`,
    { method: "POST" },
  );
}

export function listMyOccurrences() {
  return request<Occurrence[]>("/api/ocorrencias/minhas");
}

export function updateOccurrenceStatus(
  id: number,
  status: StatusOcorrencia,
  resposta: string,
) {
  return request<void>(`/api/prefeitura/ocorrencias/${id}/andamento`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, resposta }),
  });
}
