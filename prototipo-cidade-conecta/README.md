# CidadeConecta

Projeto pessoal em Next.js para registrar, acompanhar e visualizar ocorrências urbanas.

## Requisitos

- Node.js 20 ou superior
- pnpm 12 ou superior

## Instalação

1. Extraia o projeto e abra a pasta no VS Code.
2. Instale as dependências:

```bash
pnpm install
```

3. Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Este protótipo não exige variáveis de ambiente para funcionar localmente. Mantenha o arquivo `.env.local` sem chaves secretas.

## Desenvolvimento

```bash
pnpm dev
```

Abra http://localhost:3000 no navegador.

## Produção

Gere a versão de produção:

```bash
pnpm build
```

Inicie o servidor:

```bash
pnpm start
```

## Funcionalidades incluídas

- Navegação por abas: Início, Minhas ocorrências, Cidades e regiões, IA e voz, Mapa e Painel da prefeitura.
- Registro demonstrativo por voz, texto, mídia e opção de anonimato.
- Carrossel automático de cidades beneficiadas.
- Seleção de regiões, capitais e cidades do interior.
- Mapa demonstrativo de ocorrências com status, localização, detalhes do relato e apoio.
- Área do usuário com histórico, impacto e edição de perfil.
- Central de notificações com atualizações de apoio, visualizações e resoluções.

Os dados são demonstrativos e ficam em memória durante a sessão do navegador. Não há banco de dados ou APIs externas configurados nesta versão.

## Estrutura

- `app/`: página principal, layout e estilos globais.
- `components/`: componentes reutilizáveis de interface.
- `lib/`: utilitários.
- `public/`: imagens e ícones locais.
- `next.config.mjs`, `tsconfig.json` e `postcss.config.mjs`: configurações do projeto.

## Projeto pessoal

Este repositório é executado localmente e não depende de serviços de hospedagem, analytics ou variáveis de ambiente externas.
