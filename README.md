# CEP Solidário

Aplicação web para consulta de CEP, consulta e registro colaborativo de informações de acessibilidade, cadastro consentido de pessoas e endereços, e uma área B2B experimental para chaves de API e métricas.

> **Estado do produto:** projeto demonstrativo/educacional. A interface e a API estão implementadas, mas autenticação corporativa, chaves e métricas são mantidas em memória; cobrança não está integrada. Não use dados pessoais reais nem trate relatos comunitários como certificação de acessibilidade.

## O que funciona hoje

- Consulta de CEP no backend com provedores alternativos, exposição da fonte consultada e informações de acessibilidade associadas.
- Cadastro de avaliação de acessibilidade e exibição em mapa, lista e exportação CSV.
- Exemplos de avaliação não verificados somente fora de produção; cada exemplo é marcado como demonstração.
- Cadastro de pessoas com validação de campos e consentimento explícito. O backend armazena dados pessoais no MySQL quando disponível.
- `GET /api/pessoas` retorna apenas o total e contagens agregadas por município/UF; não retorna nomes, CPF ou endereço.
- Área B2B experimental com cadastro/login, sessão por cookie, criação/revogação de API keys e métricas separadas por empresa.
- Limitação geral de requisições e limite mais restrito para login/cadastro.
- Docker Compose com frontend Nginx, API Node/Express e MySQL.

## Limitações importantes

- **Persistência B2B:** empresas, sessões, API keys, limites e métricas são mantidos em memória e desaparecem ao reiniciar o backend.
- **Acessibilidade:** avaliações são mantidas em memória para leitura durante a execução. Novas avaliações também são gravadas no MySQL quando conectado, mas a aplicação ainda não carrega as avaliações persistidas do banco ao iniciar; não há garantia de recuperação completa após reinício.
- **Planos e cobrança:** apenas o plano gratuito pode ser usado. Checkout e webhook retornam `501 Not Implemented`; planos pagos não podem ser ativados pela interface ou API.
- **Conta demo:** não há conta corporativa pré-configurada; crie uma conta de teste pelo formulário de cadastro.
- **Modo sem MySQL:** desenvolvimento pode operar com fallback em memória para cadastros. Em produção, o backend não inicia sem conexão MySQL.
- **LGPD:** consentimento explícito e agregação pública estão implementados, mas isso não equivale a conformidade jurídica completa. Faltam, entre outros, políticas de retenção, fluxo de acesso/eliminação, controles operacionais e revisão jurídica.
- O projeto não usa Redis nem worker. A limitação de requisições atual é em memória e não é compartilhada entre instâncias.
- Os registros de avaliação comunitária são relatos, não inspeções independentes nem certificações.

## Stack e arquitetura

- Frontend: React 19, TypeScript, Vite, Tailwind CSS e Leaflet.
- Backend: Node.js, Express, TypeScript, `mysql2`.
- Infraestrutura Compose: `frontend`, `backend` e `db` (MySQL 8). O MySQL publica a porta somente em `127.0.0.1:3306`; o volume `mysql_data` mantém os arquivos do banco.
- O backend serve a API e, no modo local, integra o middleware do Vite. Em Compose, Nginx publica o frontend e encaminha `/api` para o backend.

## Executar localmente (Windows / PowerShell)

Requer Node.js 20+ e npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Acesse `http://localhost:3000`. Sem MySQL, o modo de desenvolvimento usa memória; esses dados não são duráveis.

## Executar localmente pelo WSL (Ubuntu)

Como o Docker está instalado/ativo no WSL deste ambiente, use o terminal Ubuntu. No PowerShell, entre nele com `wsl -d Ubuntu`; depois execute:

```bash
cd /mnt/c/Users/renato/Downloads/projetos-aleatorio-estudos/cep-solidario-intelligence-saas
npm ci
npm run lint
npm run build
npm run test:security
```

Para testar a API localmente sem Docker, inicie `npm run dev` em um terminal WSL e, em outro terminal WSL, na mesma pasta, execute:

```bash
npm run test:api
```

Esse modo pode usar o fallback de memória se MySQL não estiver ativo. Não demonstra persistência durável.

## Executar com Docker Compose

1. Copie `.env.example` para `.env`.
2. Substitua `MYSQL_ROOT_PASSWORD` e `MYSQL_PASSWORD` por segredos fortes e exclusivos. Não publique `.env`.
3. No WSL, entre na pasta do projeto e valide a configuração:

```bash
cd /mnt/c/Users/renato/Downloads/projetos-aleatorio-estudos/cep-solidario-intelligence-saas
docker compose config --quiet
```

4. Construa e inicie os serviços:

```bash
docker compose up --build -d
docker compose ps
```

- Interface: `http://localhost:3000`
- API: `http://localhost:5000/api/health`
- Diagnóstico: `http://localhost:5000/api/system/docker-status`

Veja logs se algum serviço não ficar saudável:

```bash
docker compose logs --tail=100 db backend frontend
```

Depois de alterar o código, rode `docker compose up --build -d` novamente para reconstruir e substituir os containers deste Compose. Para apenas acompanhar a inicialização, use `docker compose logs -f backend`.

Para encerrar sem apagar o volume:

```bash
docker compose down
```

`docker compose down -v` remove o volume e apaga os dados locais do MySQL; use somente se essa for a intenção.

## Falha no deploy

O repositório não contém workflow do GitHub Actions (`.github/workflows`) e não há execuções de Actions registradas para a branch `main`. Portanto, o push por si só não publica uma implantação; ela depende do serviço externo onde o deploy foi configurado.

Antes de investigar um deploy remoto, valide localmente com `npm run lint`, `npm run build` e `npm run test:security`, ou construa as imagens com `docker compose build`. Se o deploy continuar falhando, consulte os logs do provedor (por exemplo, Render, Railway, Vercel ou outro) e compartilhe o nome do serviço, etapa que falhou e mensagem de erro relevante, removendo tokens, senhas e variáveis secretas.

## Rotas principais

| Método e rota | Acesso | Comportamento |
|---|---|---|
| `GET /api/health` | Público | Estado da API |
| `GET /api/cep/:cep` | Público | Consulta CEP e avaliações associadas |
| `POST /api/v1/validate` | API key | Valida/enriquece um CEP |
| `POST /api/v1/batch` | API key | Processa lote limitado a 100 CEPs |
| `GET /api/acessibilidade` | Público | Lista avaliações disponíveis na memória |
| `GET /api/acessibilidade/:cep` | Público | Avaliações e resumo associados ao CEP |
| `POST /api/acessibilidade` | Público | Registra avaliação comunitária |
| `PUT /api/acessibilidade/:id/upvote` | Público | Confirmação comunitária |
| `GET /api/mapa` e `/api/mapa/nacional` | Público | Dados de mapa mantidos em memória |
| `GET /api/export/csv` | Público | Exportação CSV com neutralização de fórmulas |
| `GET /api/pessoas` | Público | Total e contagens agregadas por município/UF |
| `POST /api/pessoas` | Público | Cadastro com consentimento explícito; resposta contém apenas ID e data |
| `/api/auth/*`, `/api/api-keys`, `/api/admin/usage` | Sessão corporativa | Conta, chaves e métricas em memória |
| `POST /api/checkout/session`, `POST /api/webhooks/stripe` | Indisponível | Respondem `501`; pagamentos não estão configurados |

A especificação OpenAPI está disponível em `/api/docs/openapi.json`. Ela descreve a interface da API e não implica que pagamentos ou persistência B2B estejam ativos.

## Verificações

```powershell
npm run lint
npm run build
npm run test:security
```

`npm run lint` executa o typecheck TypeScript. `npm run test:security` cobre a neutralização de fórmulas CSV, o isolamento de métricas entre empresas e o escopo de listagem de chaves.

Com a API iniciada em outro terminal:

```powershell
npm run test:api
```

Para testar a camada de cadastro e o MySQL configurado:

```powershell
npm run test:db
```

O script de banco tenta conectar ao MySQL; em desenvolvimento, sem conexão, executa usando fallback em memória. O registro sintético de teste é removido ao final.

## Documentação

- [Testes e validação](docs/testes-e-validacao.md)
- [Segurança e privacidade](docs/seguranca-e-privacidade.md)
- [Roteiro de defesa do projeto](docs/roteiro-defesa-e-perguntas-professor.md)
- [Guia visual](docs/guia-visual.md)
