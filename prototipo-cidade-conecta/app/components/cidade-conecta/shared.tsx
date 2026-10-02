export function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        <img src="/cidade-conecta-marca.svg" alt="" aria-hidden="true" />
      </span>
      <span>
        Cidade<span className="logo-green">Conecta</span>
      </span>
    </div>
  );
}

export function Status({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span className={`status status-${color}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}

export type PageName =
  | "inicio"
  | "ocorrencias"
  | "cidades"
  | "ia"
  | "mapa"
  | "usuario";

export const problems = [
  {
    icon: "🕳️",
    name: "Buraco na via",
    neighborhood: "Centro",
    status: "Em análise",
    color: "blue",
    date: "Hoje, 09:42",
    votes: 12,
  },
  {
    icon: "💡",
    name: "Iluminação pública",
    neighborhood: "Vila Nova",
    status: "Em atendimento",
    color: "orange",
    date: "12 jun, 16:20",
    votes: 8,
  },
  {
    icon: "🗑️",
    name: "Descarte irregular de lixo",
    neighborhood: "Jardim América",
    status: "Resolvida",
    color: "green",
    date: "08 jun, 11:05",
    votes: 24,
  },
];

export const regions = [
  {
    name: "Norte",
    capitals: ["Manaus", "Belém", "Macapá", "Palmas"],
    interior: ["Parintins", "Santarém", "Marabá"],
  },
  {
    name: "Nordeste",
    capitals: [
      "Recife",
      "Salvador",
      "Fortaleza",
      "São Luís",
      "Natal",
      "João Pessoa",
      "Maceió",
      "Aracaju",
      "Teresina",
    ],
    interior: ["Caruaru", "Campina Grande", "Feira de Santana"],
  },
  {
    name: "Centro-Oeste",
    capitals: ["Brasília", "Goiânia", "Cuiabá", "Campo Grande"],
    interior: ["Anápolis", "Rondonópolis", "Dourados"],
  },
  {
    name: "Sudeste",
    capitals: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Vitória"],
    interior: ["Campinas", "Santos", "Uberlândia", "Niterói"],
  },
  {
    name: "Sul",
    capitals: ["Curitiba", "Florianópolis", "Porto Alegre"],
    interior: ["Londrina", "Joinville", "Caxias do Sul", "Maringá"],
  },
];
