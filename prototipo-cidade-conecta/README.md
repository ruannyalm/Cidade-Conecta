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

Configure `NEXT_PUBLIC_API_URL` em `.env.local` para apontar para o backend Spring Boot. Para desenvolvimento local, use `http://localhost:8090`.

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
- Município de atendimento fixo em Acopiara, Ceará, com as ruas cadastradas no formulário.
- Mapa de ocorrências agrupadas por rua, ligado aos relatos persistidos pela API.
- Painel da prefeitura para atualizar o andamento e responder aos relatos.
- Área do usuário com histórico, impacto e edição de perfil.
- Central de notificações com atualizações de apoio, visualizações e resoluções.

Os relatos são enviados para o backend Spring Boot e aparecem no mapa agrupados pelo endereço selecionado. Para conectar o frontend local à API local, configure `NEXT_PUBLIC_API_URL=http://localhost:8090` em `.env.local` e reinicie o Next.js.

### Dados de demonstração do backend

Os sete relatos de exemplo são criados somente com o perfil Spring `dev` e quando `DEMO_DATA_ENABLED=true`. Eles são gravados no banco PostgreSQL remoto indicado por `DB_URL`, `DB_USERNAME` e `DB_PASSWORD`. Use apenas um banco isolado de desenvolvimento/teste; não ative a carga de exemplos na base de produção. Os títulos começam com `[EXEMPLO]` e a carga é idempotente.

O frontend local aponta para `http://localhost:8090`; assim, rode o backend local conectado ao banco remoto. No PowerShell:

```powershell
Set-Location .\conecta
.\run-dev-online-db.ps1
```

O script solicita a URL e o usuário do banco remoto e lê a senha como entrada segura, sem gravá-los no repositório. Ele exige a confirmação `SEED-DEV` antes de iniciar e limpa as variáveis de ambiente ao parar. Se a autenticação falhar, confirme/atualize as credenciais no painel do provedor e rode novamente; não compartilhe a senha no chat.

## Estrutura

- `app/`: página principal, layout e estilos globais.
- `components/`: componentes reutilizáveis de interface.
- `lib/`: utilitários.
- `public/`: imagens e ícones locais.
- `next.config.mjs`, `tsconfig.json` e `postcss.config.mjs`: configurações do projeto.

## Projeto pessoal

O frontend pode ser executado localmente. As operações persistentes dependem do backend e do banco configurado por variáveis de ambiente; não use credenciais de produção para carregar dados de demonstração.
