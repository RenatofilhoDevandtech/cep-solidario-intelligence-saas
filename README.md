# ♿ CEP Solidário & Intelligence SaaS

> **Plataforma de consulta de endereços e mapeamento colaborativo de acessibilidade urbana, com referências a ABNT NBR 9050 e WCAG 2.1 AA.**
> Une validação de CEP com **triplo fallback** e informações comunitárias de acessibilidade para pessoas, responsáveis, instituições e empresas.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-v5.7-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/react-v19.0-61dafb.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/docker-multi--stage%20ready-blue.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WCAG 2.1 AA](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-success.svg)](https://www.w3.org/WAI/WCAG21/quickref/)
[![ABNT NBR 9050](https://img.shields.io/badge/norma-ABNT%20NBR%209050-emerald.svg)](https://www.abnt.org.br/)

## 🎓 Guia de Avaliação & Defesa do Projeto (Requisitos Obrigatórios)

> 📌 **Apresentação & Pitch Completo:** Para o roteiro passo a passo de apresentação ao professor, com simulação das perguntas da banca e respostas prontas em 1ª pessoa, consulte o arquivo dedicado: **[docs/roteiro-defesa-e-perguntas-professor.md](docs/roteiro-defesa-e-perguntas-professor.md)**.

Este projeto foi construído para atender com **100% de conformidade** ao desafio de arquitetura multi-container, API REST e persistência de dados. Abaixo estão descritas as respostas para todos os pontos exigidos pela banca avaliadora:

### 1️⃣ Arquitetura Multi-Container (Docker Compose)
O projeto utiliza obrigatoriamente o **Docker Compose** (`docker-compose.yml`) orquestrando os serviços em containers isolados:
1. **Frontend (`cep_solidario_frontend`)**: Container baseado em `nginx:alpine`, servindo o bundle compilado do React e atuando como reverse proxy na porta `3000`.
2. **Backend/API (`cep_solidario_backend`)**: Container Node.js 20 Alpine expondo a API REST na porta `5000`.
3. **Banco de Dados (`cep_solidario_mysql`)**: Container MySQL 8.0 oficial operando na porta `3306`, com persistência durável em volume Docker.
4. **Cache & Fila (`cep_solidario_redis`)**: Container Redis 7 Alpine na porta `6379` (serviço complementar de cache e rate limiting).

---

### 2️⃣ Como os containers se comunicam? (Network Docker)
* Todos os containers compartilham a mesma rede bridge privada chamada **`cep_network`**.
* O container de **Frontend (Nginx)** intercepta todas as requisições direcionadas para `/api` e faz um `proxy_pass http://backend:5000;`. O tráfego ocorre internamente através do DNS interno do Docker.
* O container de **Backend (Node.js)** se comunica com o banco de dados via TCP na porta `3306` usando o hostname do serviço: `db` (resolvido automaticamente pelo Docker como `db:3306`).
* **Vantagem de Segurança:** As portas internas e o tráfego de dados entre API e Banco não precisam ser expostos publicamente na internet, garantindo isolamento de rede.

---

### 3️⃣ Como o Volume mantém os dados? (Persistência no MySQL)
* O banco de dados MySQL armazena seus arquivos em `/var/lib/mysql`.
* No `docker-compose.yml`, configuramos o volume nomeado:
  ```yaml
  volumes:
    - mysql_data:/var/lib/mysql
  ```
* **Garantia de Persistência:** Mesmo se o container `cep_solidario_mysql` for parado (`docker compose stop`) ou completamente destruído e removido (`docker compose rm`), os dados do cadastro de pessoas e avaliações permanecem intactos no volume `mysql_data` gerenciado pelo Docker no disco do host. Ao recriar o container (`docker compose up -d`), o MySQL reconecta-se ao volume e restaura todo o estado anterior.

---

### 4️⃣ Como funciona a API REST? (Endpoints Obrigatórios)
A API Express implementa as rotas REST para cadastro e listagem:
* **`POST /api/pessoas` (Cadastro):**
  * Recebe os dados informados pelo usuário: `nome`, `cpf`, `cep`, `numero`, `complemento`.
  * Consulta e valida os dados de endereço via API de CEP (ViaCEP / BrasilAPI): `logradouro`, `bairro`, `localidade`, `uf`, `estado` e `rua`.
  * Persiste o registro na tabela `pessoas` do MySQL e retorna HTTP 201 com o ID gerado.
* **`GET /api/pessoas` (Listagem):**
  * Consulta o MySQL (`SELECT * FROM pessoas ORDER BY created_at DESC`) e retorna a lista completa em formato JSON (HTTP 200).
* **`POST /api/acessibilidade` e `GET /api/acessibilidade/:cep`:**
  * Avaliações comunitárias de acessibilidade (rampas, elevadores, piso tátil) persistidas em tempo real no MySQL.
* **`GET /api/system/docker-status`:**
  * Endpoint de telemetria que audita o status dos 3 containers e a saúde da conexão com o volume MySQL.

---

### 5️⃣ Por que escolhemos essas tecnologias?
* **React + Vite + Tailwind CSS (Frontend):** Alta performance de renderização, componentes reativos reutilizáveis, design system moderno acessível (WCAG 2.1 AA / ABNT NBR 9050) e compilação ultra-rápida.
* **Node.js + Express + TypeScript (Backend):** Ecossistema robusto para APIs REST orientadas a I/O não bloqueante, tipagem estática segura, facilidade de manipulação de requisições HTTP assíncronas com múltiplos fallbacks de CEP e integração com MySQL via `mysql2`.
* **MySQL 8.0 (Banco de Dados Relacional):** Suporte completo a transações ACID, integridade referencial, queries estruturadas e maturidade de produção para dados relacionais de pessoas e endereços.
* **Nginx (Reverse Proxy):** Servidor web de alta performance que elimina problemas de CORS ao unificar o acesso à aplicação e ao backend na mesma origem.

---

### 6️⃣ Conformidade com a LGPD (Diferencial de Engenharia)
Em conformidade com a **Lei Geral de Proteção de Dados (Lei nº 13.709/2018)**:
* O formulário conta com **Termo de Consentimento Explícito** (Art. 7º, I da LGPD).
* Na listagem pública de pessoas, o CPF é exibido com **máscara de anonimização** (`***.456.789-**`) para evitar vazamento de dados sensíveis (Princípio da Segurança e Minimização - Art. 6º, VII).
* A interface inclui um botão **"Modo Banca / Auditoria"** que permite ao avaliador revelar o CPF completo para validação do requisito acadêmico.

---

### 7️⃣ Como executar a aplicação?

```bash
# 1. Clone o repositório ou acesse a pasta do projeto:
cd cep-solidario-intelligence-saas

# 2. Suba o ambiente completo de 3 containers com Docker Compose:
docker compose up --build
```

Acesse no navegador:
* **Aplicação Completa:** [http://localhost:3000](http://localhost:3000) (Aba: **"Pessoas & Endereços"**)
* **API REST Direta:** [http://localhost:5000/api/pessoas](http://localhost:5000/api/pessoas)
* **Diagnóstico Docker:** [http://localhost:5000/api/system/docker-status](http://localhost:5000/api/system/docker-status)

Para encerrar os containers:
```bash
docker compose down
```

---

## Estado da Aplicação e Demonstração


Para evitar ambiguidade, este README diferencia recursos **implementados**, **preparados** e **planejados**. Os recursos implementados funcionam na demonstração atual; os preparados possuem estrutura inicial, mas ainda exigem integração; os planejados não devem ser tratados como promessa de produção.

### Estado atual da experiência

- Busca de CEP com fontes alternativas e estado de erro acionável.
- Resultado de CEP com transparência sobre fonte, avaliações e ausência de dados.
- Mapa colaborativo com filtros de acessibilidade e lista de locais.
- Página 404 para rotas inexistentes, sem confundir com CEP não encontrado.
- PWA com manifest, ícone, service worker e instalação pelo navegador em HTTPS.
- Componentes compartilhados para acessos rápidos, erros e filtros do mapa.
- Tokens de cor, tipografia, superfícies e sombras em `src/design-system/tokens.css`.

O frontend e o backend seguem um **monólito modular**. As responsabilidades são separadas em componentes, serviços e módulos de domínio, mas ainda existe uma única aplicação para simplificar desenvolvimento, deploy e observabilidade. A divisão em microserviços só deve acontecer quando houver necessidade comprovada de escala ou isolamento operacional.

Documentação complementar:

- [Guia de testes e validação](docs/testes-e-validacao.md)
- [Guia do usuário](docs/guia-do-usuario.md)
- [Arquitetura da informação](docs/arquitetura-da-informacao.md)
- [Visão de produto e carreira](docs/visao-produto-e-carreira.md)
- [Prós, contras e soluções](docs/pros-contras-e-solucoes.md)
- [Guia visual](docs/guia-visual.md)

O backend agora possui:

- sessão corporativa em cookie `HttpOnly`, com senha protegida por `scrypt`;
- rotas administrativas e de API keys protegidas por sessão;
- `/api/v1/validate` e `/api/v1/batch` protegidas por `x-api-key` e limite por minuto;
- headers de segurança via Helmet e limite geral de requisições;
- webhook Stripe bloqueado quando `STRIPE_WEBHOOK_SECRET` não está configurado.

### Execução local no Windows

Renomeie a pasta para remover `&` do caminho, por exemplo `cep-solidario-intelligence-saas`. O caractere `&` interfere nos scripts npm do PowerShell.

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000`. A conta demonstrativa local é `contato@logisticaexpress.com.br` com senha `123456`. Essa conta existe apenas para desenvolvimento e deve ser removida antes de um ambiente público.

### Instalação como PWA

Depois de publicar a aplicação em HTTPS, o navegador pode oferecer a opção **Instalar** ou **Adicionar à tela inicial**. Não é necessário publicar na Play Store para usar o PWA.

O modo instalável inclui o shell da aplicação e não armazena respostas dinâmicas de `/api` no cache offline. A disponibilidade de instalação e alguns recursos varia entre navegadores, especialmente no iOS.

### Execução pelo WSL

Com Docker Desktop integrado ao WSL ou Docker Engine instalado na distribuição:

```bash
cp .env.example .env
# edite .env e troque as senhas de banco
npm install
npm run lint
npm run build
docker compose up --build
```

Acesse `http://localhost:3000`. Para encerrar:

```bash
docker compose down
```

O `Dockerfile` raiz executa o backend full-stack na porta `3000`. O Compose usa frontend Nginx na porta `3000` e backend na porta `5000`; escolha um dos modos por vez para evitar conflito de porta.

### Integrações e responsabilidades

- **CEP:** o backend consulta ViaCEP, BrasilAPI e AwesomeAPI em cascata e mantém cache em memória por 24 horas.
- **Acessibilidade:** avaliações e mapa são atualmente mantidos em memória.
- **B2B:** login cria uma sessão de processo; API keys e métricas também são mantidas em memória.
- **Stripe:** checkout é um fluxo demonstrativo. Não informe cartões reais; cobrança real exige SDK Stripe, assinatura do webhook e persistência.
- **MySQL/Redis:** estão preparados como infraestrutura do Compose, mas ainda precisam de repositories/adapters para serem usados pela aplicação.
- **Worker:** está descrito na infraestrutura para processamento futuro de lotes; o fluxo atual deve ser tratado como demonstração até a execução assíncrona ser validada.

### Rotas protegidas

- Públicas: `/api/health`, `/api/cep/:cep`, `/api/acessibilidade`, `/api/mapa` e documentação.
- Sessão corporativa: `/api/admin/usage`, `/api/api-keys` e `/api/auth/update-plan`.
- API key: `/api/v1/validate` e `/api/v1/batch`, usando `x-api-key`.
- Webhook: `/api/webhooks/stripe`, somente com `STRIPE_WEBHOOK_SECRET` e o header correspondente.

### Limitações conhecidas

- Avaliações, mapa, API keys, métricas e sessões dependem de armazenamento em memória na demonstração atual.
- Reiniciar o backend pode apagar dados que ainda não foram persistidos em banco.
- A cobertura de acessibilidade varia por cidade; a ausência de um local não significa ausência de acessibilidade.
- O PWA exige HTTPS em produção e possui diferenças de suporte entre navegadores.
- Imagens de ruas não fazem parte do fluxo atual; uma integração futura deve avaliar custo, cobertura e licença.
- O checkout Stripe é demonstrativo e não deve receber cartões reais.

### Verificações executadas

```bash
npm run lint
npm run build
```

`npm run lint` executa o typecheck do TypeScript. `npm run build` compila o frontend com Vite e o backend com esbuild. Esses comandos validam compilação, mas ainda não substituem testes automatizados de comportamento, acessibilidade e integração.

---

## 📑 Sumário Executivo & Técnico

1. [Visão de Impacto Duplo (Social ESG + B2B Logístico)](#-visão-de-impacto-duplo)
2. [Diferenciais Técnicos para Recrutadores & Avaliadores](#-diferenciais-técnicos-para-recrutadores--professores)
3. [Arquitetura de Software & Padrões Clean Architecture](#-arquitetura--clean-architecture)
4. [Stack Tecnológica Completa](#-stack-tecnológica)
5. [Guia de Execução Rápida (Docker, Docker Compose & Local)](#-guia-de-execução)
   - [Opção 1: Container Único de Produção (Cloud Run / AWS / Dockerfile)](#1-container-único-dockerfile-produção)
  - [Opção 2: Infraestrutura modular com Docker Compose (MySQL + Redis + Worker)](#2-infraestrutura-modular-com-docker-compose)
   - [Opção 3: Modo de Desenvolvimento Local](#3-modo-de-desenvolvimento-local)
6. [API RESTful & Exemplos Práticos de Integração (cURL, JS, Python)](#-api-restful--especificação-openapi-30)
   - [Consulta com Triplo Fallback](#1-consulta-de-cep-pública-com-fallback-resiliente)
   - [Validação & Score Preditivo de Entrega (B2B)](#2-validação--enriquecimento-b2b-score-e-risco)
   - [Validação em Lote (Batch até 1.000 CEPs)](#3-validação-em-lote-batch)
   - [Mapeamento Colaborativo para Todas as Deficiências](#4-cadastro-de-acessibilidade-todas-as-deficiências)
   - [Sessão de Checkout Stripe SaaS](#5-checkout-e-monetização-saas-stripe)
7. [Inclusão Universal & Critérios ABNT NBR 9050](#-inclusão-universal-todas-as-deficiências)
8. [Widget Embeddable para E-commerce (1 Linha de Código)](#-widget-embeddable-para-e-commerce)
9. [Modelo de Negócio, Pricing e Monetização SaaS](#-modelo-de-negócio--monetização-saas)
10. [Conformidade com a LGPD e Segurança](#-conformidade-lgpd--segurança)
11. [Estrutura de Pastas e Separação de Responsabilidades](#-estrutura-do-projeto)

---

## 🎯 Visão de Impacto Duplo

A infraestrutura tradicional de CEPs no Brasil é historicamente fragmentada e dependente de serviços centralizados suscetíveis a instabilidades operacionais. Ao mesmo tempo, mais de **18,6 milhões de brasileiros com deficiência** enfrentam barreiras diárias de mobilidade e falta de dados prévios sobre a infraestrutura de seus destinos.

O **CEP Solidário & Intelligence** soluciona simultaneamente essas duas dores:

```
                  ┌──────────────────────────────────────────────────────────┐
                  │                 CEP SOLIDÁRIO ECOSYSTEM                  │
                  └─────────────────────────────┬────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
 ┌──────────────────────────────┐                              ┌──────────────────────────────┐
 │   FRENTE CIDADÃ & ESG        │                              │   FRENTE CORPORATIVA B2B     │
 │                              │                              │                              │
 │ • Crowdsourcing de barreiras │                              │ • Triplo Fallback Resiliente │
 │ • 4 Eixos de Deficiência     │                              │ • Score Preditivo de Risco   │
 │ • Mapa georreferenciado      │                              │ • Validação em Lote (Batch)  │
 │ • Validação com Upvotes      │                              │ • Widget Embeddable Checkout │
 │ • Exportação Open Data CSV   │                              │ • Gestão de API Keys & Rate  │
 └──────────────────────────────┘                              └──────────────────────────────┘
```

---

## 💎 Diferenciais Técnicos para Recrutadores & Professores

Se você está avaliando este projeto em um processo seletivo ou banca acadêmica, atente-se a estes destaques de engenharia:

1. **Engenharia de resiliência para consultas de CEP**:
  - Motor em cascata: se uma fonte falhar, o pipeline tenta **BrasilAPI** e **AwesomeAPI** conforme a disponibilidade e o contrato de cada integração.
  - Cache local em memória com TTL de 24h na demonstração; Redis está preparado no Compose, mas ainda não é usado pelo runtime atual.
2. **Design System "Apple Liquid Glass" & Acessibilidade Real**:
  - Efeito vidro translúcido, microinterações e paleta de alto contraste com referências às práticas **WCAG 2.1 AA**; a conformidade final exige auditoria dedicada.
   - Controles nativos acessíveis no topo: alternância imediata de **Alto Contraste**, **Texto A+** e leitor de tela falado em português via **Web Speech API**.
3. **Inclusão Abrangente para Todas as Deficiências**:
   - Vai além da rampa tradicional: cobre deficiência motora, visual (piso tátil, braille), auditiva (intérprete de **Libras**) e neurodivergência (espaços calmos para pessoas no espectro autista - TEA).
4. **Base preparada para evolução em nuvem**:
  - `Dockerfile` multi-stage para empacotamento da aplicação.
  - `docker-compose.yml` descrevendo **Nginx + Backend Express + MySQL 8.0 + Redis 7 + Worker**, com integrações de persistência e processamento assíncrono ainda pendentes.
  - TypeScript com verificação estrita e backend compilado via `esbuild` em `dist/server.cjs`.

---

## 🏗️ Arquitetura & Clean Architecture

O projeto implementa uma arquitetura desacoplada e modular baseada em **Domain-Driven Design (DDD)** simplificado e **Separação de Responsabilidades (SoC)**:

```
                                ┌───────────────────────────────────┐
                                │       Clientes & Navegadores      │
                                │   (Web SPA, Apps, E-commerces)   │
                                └─────────────────┬─────────────────┘
                                                  │ HTTP / REST / JSON
                                                  ▼
                ┌───────────────────────────────────────────────────────────────────┐
                │                     Gateway / Nginx / Reverse Proxy               │
                │                        (Porta 3000 / Cloud Ingress)               │
                └─────────────────┬───────────────────────────────┬─────────────────┘
                                  │                               │
                                  ▼                               ▼
                ┌───────────────────────────────────┐ ┌───────────────────────────────────┐
                │        Frontend SPA (React 19)    │ │       Backend API REST (Node 20)  │
                │   Vite + Tailwind CSS + Leaflet   │ │   Express + Triplo Fallback Engine│
                └───────────────────────────────────┘ └─────────────────┬─────────────────┘
                                                                        │
                          ┌─────────────────────────────────────────────┼──────────────────────────────┐
                          ▼                                             ▼                              ▼
           ┌─────────────────────────────┐               ┌─────────────────────────────┐ ┌─────────────────────────────┐
           │     Provedores Externos     │               │     MySQL 8.0 Relacional    │ │      Redis 7 (In-Memory)    │
           │  ViaCEP / BrasilAPI / Maps  │               │ DDL, Índices Geo & Avaliações│ │  Cache de CEPs & Rate Limit │
           └─────────────────────────────┘               └─────────────────────────────┘ └─────────────────────────────┘
```

### Principais Padrões de Projeto:
- **Fallback Pattern / Circuit Breaker**: Previne falha em cascata de serviços de terceiros usando AbortController e chaveamento de provedores.
- **Strategy & Pipeline**: Extração e normalização de dados de fontes públicas com estruturas heterogêneas para um modelo único canônico (`AddressResult`).
- **Repository / Service Layer**: Separação estrita entre rotas de transporte (`server.ts`), regras de domínio (`cepService.ts`, `acessibilidadeService.ts`, `b2bService.ts`) e modelos de dados.
- **Open Data Exporter**: Geração de streaming direto de dados tabulares (CSV) com codificação `UTF-8 com BOM` para compatibilidade universal com Excel, PowerBI e Python Pandas.

---

## 💻 Stack Tecnológica

### Frontend
- **React 19** + **TypeScript** (Strict mode)
- **Vite 6** (Build tool ultrarrápido com Hot Module Reloading)
- **Tailwind CSS v4** (Estilização utilitária sem bloatware de CSS)
- **Leaflet** (Mapas geoespaciais interativos open-source via OpenStreetMap)
- **Lucide React** (Iconografia semântica, vetorizada e acessível)
- **Web Speech API** (Síntese de voz nativa no navegador para acessibilidade assistiva)

### Backend & Nuvem
- **Node.js 20 LTS** + **Express**
- **esbuild** (Compilação do backend TypeScript em bundle único autônomo `dist/server.cjs`)
- **OpenAPI 3.0** (Documentação interativa com Swagger/JSON para desenvolvedores)
- **MySQL 8.0** (Esquema relacional preparado com DDL, chaves estrangeiras e índices em `init.sql`)
- **Redis 7 Alpine** (Infraestrutura preparada para cache e controle de concorrência)
- **Docker & Docker Compose** (Containerização multi-stage e infraestrutura modular)

---

## 🐳 Guia de Execução

### 1. Container Único (`Dockerfile` Produção)
Recomendado para deploy simplificado em **Google Cloud Run**, **AWS App Runner**, **Render** ou servidor VPS:

```bash
# 1. Construir imagem de produção multi-stage
docker build -t cep-solidario:latest .

# 2. Executar container expondo a porta 3000
docker run -d -p 3000:3000 --name cep_app cep-solidario:latest

# 3. Testar healthcheck do serviço
curl -i http://localhost:3000/api/health
```

Acesse no navegador: **`http://localhost:3000`**

---

### 2. Infraestrutura modular com Docker Compose
Disponibiliza a infraestrutura preparada para persistência relacional, cache e processamento futuro. A aplicação ainda não grava automaticamente em MySQL/Redis; os containers são apoio ao desenvolvimento e à próxima etapa de integração. A aplicação continua organizada como um monólito modular:

```bash
# 1. Clonar o repositório e acessar a pasta
git clone https://github.com/usuario/cep-solidario.git
cd cep-solidario

# 2. Copiar arquivo de configuração de ambiente
cp .env.example .env

# 3. Subir a infraestrutura (Frontend, Backend, MySQL, Redis, Worker)
docker compose up --build -d

# 4. Acompanhar logs do backend
docker compose logs -f backend

# 5. Para parar a infraestrutura
docker compose down
```

#### Mapeamento de Serviços no Docker Compose:
| Container | Imagem / Dockerfile | Porta | Função |
|---|---|---|---|
| `cep_solidario_frontend` | `Dockerfile.frontend` (Nginx) | `3000` | SPA estática e Proxy reverso para `/api` |
| `cep_solidario_backend` | `Dockerfile.backend` (Node 20) | `5000` | API RESTful com triplo fallback |
| `cep_solidario_mysql` | `mysql:8.0` | `3306` | Banco relacional com schemas e seeds em `init.sql` |
| `cep_solidario_redis` | `redis:7-alpine` | `6379` | Cache de logradouros e controle de requisições |
| `cep_solidario_worker` | `Dockerfile.backend` | - | Estrutura preparada para processamento em segundo plano de lotes (Batch) |

---

### 3. Modo de Desenvolvimento Local

Para rodar diretamente na sua máquina de desenvolvimento com Node.js:

```bash
# 1. Instalar todas as dependências
npm install

# 2. Executar o servidor full-stack (Vite + Express na porta 3000)
npm run dev

# 3. Executar o linter e checagem de tipos estrita
npm run lint

# 4. Compilar para produção e testar bundle final
npm run build
npm start
```

---

## 📡 API RESTful & Especificação OpenAPI 3.0

Todas as rotas retornam `application/json; charset=utf-8` e possuem suporte nativo a CORS. A especificação completa pode ser obtida em `/api/docs/openapi.json`.

### 1. Consulta de CEP Pública (com Fallback Resiliente)
Recupera dados cadastrais, geolocalização exata e indicadores de acessibilidade cadastrados pela comunidade:

- **Método**: `GET`
- **Rota**: `/api/cep/:cep`
- **Exemplo**:
```bash
curl -X GET "http://localhost:3000/api/cep/01310100"
```
- **Resposta (200 OK)**:
```json
{
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308",
  "ddd": "11",
  "lat": -23.561492,
  "lon": -46.655881,
  "fonte": "ViaCEP",
  "acessibilidade": {
    "total": 4,
    "mediaNota": 4.8,
    "percentRampa": 100,
    "percentElevador": 75,
    "percentBanheiro": 100,
    "percentVagaPcd": 75,
    "percentPisoTatil": 75,
    "percentBalcaoBaixo": 50,
    "percentLibras": 67,
    "percentSonoro": 67,
    "percentNeurodivergente": 67
  },
  "responseTimeMs": 38
}
```

---

### 2. Validação & Enriquecimento B2B (Score e Risco)
Utilizado por transportadoras e e-commerces para validação pré-despacho, redução de devoluções e compliance ESG:

- **Método**: `POST`
- **Rota**: `/api/v1/validate`
- **Cabeçalho**: `x-api-key: cs_live_9b4e8721fa09cd3491e`
- **Exemplo**:
```bash
curl -X POST "http://localhost:3000/api/v1/validate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: cs_live_9b4e8721fa09cd3491e" \
  -d '{"cep": "01310-100"}'
```
- **Resposta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "cep": "01310-100",
    "logradouro": "Avenida Paulista",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "uf": "SP",
    "score_qualidade": 98,
    "probabilidade_entrega_pct": 99,
    "nivel_risco": "BAIXO",
    "analise_risco": "Endereço consistente em via principal pavimentada com histórico pleno de entregas.",
    "esg_acessibilidade": {
      "possui_dados": true,
      "nota_media": 4.8,
      "indice_rampa": "100%",
      "indice_elevador": "75%",
      "total_avaliadores": 4
    }
  },
  "meta": {
    "fonte_primaria": "ViaCEP",
    "tempo_resposta_ms": 41,
    "timestamp": "2026-09-15T04:30:00.000Z"
  }
}
```

---

### 3. Validação em Lote (Batch)
Processa centenas de CEPs em segundos, gerando métricas agregadas e relatório para download:

- **Método**: `POST`
- **Rota**: `/api/v1/batch`
- **Corpo**:
```json
{
  "ceps": ["01310-100", "22041-001", "30130-100", "99999-999"]
}
```

---

### 4. Cadastro de Acessibilidade (Todas as Deficiências)
Crowdsourcing estruturado para registro de estabelecimentos acessíveis:

- **Método**: `POST`
- **Rota**: `/api/acessibilidade`
- **Corpo**:
```json
{
  "cep": "01310-100",
  "local_nome": "MASP - Museu de Arte de São Paulo",
  "usuario_nome": "Mariana Lima",
  "rampa_acesso": true,
  "elevador": true,
  "banheiro_adaptado": true,
  "vaga_pcd": true,
  "piso_tatil": true,
  "balcao_baixo": true,
  "interprete_libras": true,
  "sinalizacao_sonora": true,
  "espaco_calmo": true,
  "portas_largas": true,
  "comentario": "Acesso totalmente plano na entrada principal com elevador exclusivo e espaço sensorial calmo.",
  "nota_facilidade": 5
}
```

---

### 5. Base Nacional de Acessibilidade & Ranking de Estados
Visualização consolidada de todos os pontos mapeados no território brasileiro com cálculo do índice de acessibilidade por Estado (UF):

- **Método**: `GET`
- **Rota**: `/api/mapa/nacional`
- **Resposta (200 OK)**:
```json
{
  "totalLocais": 28,
  "mediaNacional": 4.6,
  "rankingEstados": [
    { "uf": "PR", "total": 3, "mediaNota": 5.0, "percentAcessivel": 100 },
    { "uf": "DF", "total": 3, "mediaNota": 4.7, "percentAcessivel": 100 },
    { "uf": "SP", "total": 6, "mediaNota": 4.6, "percentAcessivel": 100 },
    { "uf": "RS", "total": 3, "mediaNota": 4.7, "percentAcessivel": 100 }
  ],
  "locais": [
    {
      "id": "nac-cwb-1",
      "cep": "80210-090",
      "local_nome": "Jardim Botânico de Curitiba",
      "cidade": "Curitiba",
      "uf": "PR",
      "rampa_acesso": true,
      "elevador": true,
      "banheiro_adaptado": true,
      "piso_tatil": true,
      "scoreGeral": 94
    }
  ]
}
```

---

### 6. Checkout e Monetização SaaS (Stripe)
Gera uma sessão de faturamento para planos corporativos:

- **Método**: `POST`
- **Rota**: `/api/checkout/session`
- **Corpo**: `{"plan": "BUSINESS", "email": "financeiro@empresa.com.br"}`
- **Resposta**: Retorna o ID da sessão, URL de pagamento segura e metadados de assinatura.

---

## ♿ Inclusão Universal (Todas as Deficiências)

O projeto segue rigorosamente os parâmetros da **ABNT NBR 9050** e do **Estatuto da Pessoa com Deficiência (Lei nº 13.146/2015)**:

| Eixo de Inclusão | Recursos Monitorados | Requisito Técnico NBR 9050 |
|---|---|---|
| **♿ Mobilidade Física** | Rampas, elevadores adaptados, banheiros PCD, vagas reservadas, balcões rebaixados e portas largas | Inclinação máxima de rampas conforme NBR 9050, vão livre de portas $\ge 80\text{ cm}$, barras de apoio e raio de giro de 360°. |
| **👁️ Deficiência Visual** | Piso tátil direcional e de alerta, sinalização em braille e audiodescrição | Contraste de luminância do piso tátil, altura ergonômica de placas em braille e rotas desobstruídas. |
| **🧏 Deficiência Auditiva** | Atendimento presencial com intérprete de Libras e sinalização visual redundante | Profissional capacitado em Língua Brasileira de Sinais ou terminal de vídeo-chamada com intérprete. |
| **🧠 Neurodivergência (TEA)**| Espaços sensoriais calmos e isolamento de sobrecarga acústica | Ambientes com iluminação indireta controlada, redução de ruído sonoro e fluxo previsível para pessoas no espectro autista. |

---

## 🔌 Widget Embeddable para E-commerce

Qualquer loja virtual (Shopify, Nuvemshop, WooCommerce, VTEX ou sistema próprio) pode integrar a inteligência de CEP e o selo de acessibilidade em **1 única linha de código**:

```html
<!-- Cole antes do fechamento da tag </body> no seu checkout -->
<script
  src="https://ais-dev-xnsc4d2tephlbnulcjjk3y-153934450613.us-east1.run.app/v1/widget.js"
  data-api-key="cs_live_9b4e8721fa09cd3491e"
  data-autofill="true"
  data-validate-realtime="true"
  data-accessibility="true"
  async>
</script>
```

### O que o Widget faz automaticamente:
- Completa logradouro, bairro, cidade e estado em menos de 100ms.
- Corrige digitações incorretas de formato (`XXXXX-XXX`).
- Exibe o badge de estabelecimento acessível diretamente no endereço de entrega.

---

## 💼 Modelo de Negócio & Monetização SaaS

O projeto apresenta um modelo de negócio **Freemium & B2B ESG Subscription** para demonstração. Os valores e recursos abaixo são uma proposta de produto, não uma cobrança ativa em produção:

| Plano | Valor Mensal | Cota de Requisições | Recursos Chave |
|---|---|---|---|
| **Comunitário (Dev)** | Grátis | 100 req / dia | Consulta pública de CEP, histórico local e mapa colaborativo |
| **Startup** | R$ 99 | 10.000 req / mês | Widget de checkout demonstrativo, chave `x-api-key` e rate limit configurável |
| **Business (ESG)** | R$ 499 | 100.000 req / mês | Score de entrega, validação em lote e dados de acessibilidade conforme integração disponível |
| **Enterprise** | R$ 2.499 | 1.000.000 req / mês | Proposta de SLA, instância dedicada e suporte prioritário, sujeitos a contrato e implementação |

---

## 🛡️ Conformidade LGPD & Segurança

- **Privacidade por Design (Privacy by Design)**: Nenhum dado pessoal sensível (CPF, RG ou dados de cartão bancário) é persistido no banco de dados.
- **Transparência de Dados Públicos**: As avaliações de acessibilidade referem-se estritamente a logradouros, praças, museus e estabelecimentos de uso público.
- **Auditoria de API**: As chaves corporativas gravam apenas logs técnicos anônimos (timestamp, código de retorno HTTP e tempo de resposta) para detecção de abuso e controle de rate limiting.

---

## 📁 Estrutura do Projeto

```
cep-solidario/
├── Dockerfile                  # Imagem de produção multi-stage otimizada
├── Dockerfile.backend          # Imagem de backend para Docker Compose
├── Dockerfile.frontend         # Imagem com Nginx para Docker Compose
├── docker-compose.yml          # Orquestrador (App, MySQL 8, Redis 7, Worker)
├── init.sql                    # DDL, índices geográficos e seeds do MySQL
├── package.json                # Dependências e scripts npm
├── tsconfig.json               # Configurações rigorosas do TypeScript
├── vite.config.ts              # Configuração Vite e plugins
├── server.ts                   # Entry point do servidor Express & Vite Middleware
├── public/                     # Manifest, ícone e service worker do PWA
│   └── icons/icon.svg
├── docs/                       # Guias de usuário, arquitetura, produto e design
├── server/                     # Módulos de domínio do backend
│   ├── cepService.ts           # Motor de Triplo Fallback (ViaCEP + BrasilAPI + AwesomeAPI)
│   ├── acessibilidadeService.ts# Avaliações, upvotes, cálculo de raio e exportador CSV
│   └── b2bService.ts           # Chaves de API, logs, score logístico e OpenAPI spec
└── src/                        # Aplicação Web Frontend (React 19 + TypeScript)
    ├── App.tsx                 # Layout principal, controle de abas e estado global
    ├── types.ts                # Definições estritas de interfaces e tipos
    ├── design-system/
    │   └── tokens.css           # Tokens de cores, tipografia e superfícies
    ├── services/
    │   └── api.ts              # Cliente HTTP tipado para consumo da API REST
    └── components/             # Componentes modulares e reutilizáveis
        ├── Header.tsx          # Barra de status, leitor de voz, alto contraste e texto A+
        ├── CepSearch.tsx       # Orquestra a consulta e o resultado
        ├── cep/CepQuickAccess.tsx # Cidades, histórico e acessos rápidos
        ├── feedback/ErrorState.tsx # Estado de erro reutilizável
        ├── map/MapFilters.tsx  # Filtros configuráveis do mapa
        ├── MapaAcessivel.tsx   # Mapa interativo Leaflet com filtros por deficiência
        ├── AvaliacoesLista.tsx # Estabelecimentos e upvotes comunitários
        ├── AcessibilidadeForm.tsx # Modal de cadastro categorizado por deficiência
        ├── B2bDashboard.tsx    # Portal corporativo, métricas, sandbox e chaves
        ├── BatchValidator.tsx  # Validador de lotes de CEP com exportação
        ├── CheckoutWidgetDemo.tsx # Demonstração interativa do script para e-commerce
        ├── ApiDocs.tsx         # Documentação interativa OpenAPI 3.0 e cURL
        ├── CompanyAuthModal.tsx# Autenticação de empresas com modo Demo 1-clique
        ├── PricingModal.tsx    # Tabela de planos e simulação de checkout Stripe
        └── NotFound.tsx         # Estado visual para rotas inexistentes
```

---

## 👨‍💻 Autor & Informações Acadêmicas

Desenvolvido como projeto de referência e demonstração de **Engenharia de Software de Alto Impacto**, combinando:
- **Resiliência e Tolerância a Falhas em Sistemas Distribuídos**;
- **Acessibilidade Digital Universal (e-MAG / WCAG 2.1)**;
- **Modelagem de Dados Relacional e Cache Distribuído**;
- **Arquitetura Cloud-Native e Containerização de Produção**.

Distribuído sob a licença **MIT**. Sinta-se livre para contribuir, integrar ou avaliar!
