# Roteiro de apresentação e defesa

## Pitch curto

> O CEP Solidário combina consulta de CEP com informações colaborativas de acessibilidade. A aplicação também demonstra cadastro consentido de endereços e uma área B2B experimental. Escolhi React/TypeScript no frontend, Express/TypeScript na API e MySQL para persistir os cadastros de pessoas. A implantação local com Docker Compose separa frontend, backend e banco. A demonstração prioriza transparência: cadastros públicos são agregados, exemplos de acessibilidade são marcados como não verificados e pagamentos ainda não estão habilitados.

## Como demonstrar

1. Configure `.env` a partir de `.env.example`; use senhas locais fortes e não use dados pessoais reais.
2. Suba os três serviços com `docker compose up --build`.
3. Abra `http://localhost:3000`, consulte um CEP e observe a informação de fonte/erro.
4. Abra o mapa/lista de acessibilidade. Em desenvolvimento, os registros de exemplo estão marcados como demonstração não verificada. Em produção não há avaliações de exemplo.
5. Se demonstrar cadastro de pessoa, use dados sintéticos e aceite o consentimento explicitamente. Mostre que a consulta pública exibe somente contagens por município/UF.
6. Mostre `http://localhost:5000/api/system/docker-status` para conferir o estado do backend e do MySQL.
7. Opcionalmente, rode `npm run test:security` e `npm run test:api`.

Não use nomes, CPFs ou endereços reais na apresentação. Evite imprimir payloads de cadastro ou credenciais nos logs/compartilhamento de tela.

## Arquitetura que existe

- **Frontend:** React 19 e Vite, servido em Compose por Nginx na porta 3000.
- **Backend:** Express/TypeScript na porta 5000 em Compose. No modo local, Vite e API são servidos pelo mesmo processo.
- **Banco:** MySQL 8 com volume nomeado `mysql_data`. A porta do banco é vinculada a `127.0.0.1:3306` no host.
- **Rede:** os três serviços do Compose compartilham a rede bridge `cep_network`. Nginx encaminha chamadas `/api` para `backend:5000`; o backend acessa MySQL pelo hostname `db`.
- **Serviços que não existem atualmente:** Redis e worker. O rate limit e várias estruturas da aplicação são em memória.

## Persistência e privacidade

- Cadastros de pessoas são inseridos no MySQL quando conectado. O endpoint de leitura pública calcula total e contagens por município/UF; não expõe PII.
- Em desenvolvimento sem MySQL, o cadastro pode usar memória volátil. Em produção, o backend exige MySQL e falha ao iniciar se o banco estiver indisponível.
- Avaliações e mapa são lidos de estruturas em memória. Novas avaliações também são gravadas no MySQL quando conectado, mas ainda não são carregadas do banco ao iniciar; portanto, a recuperação após reinício não está completa.
- Contas, sessões, API keys, limites e métricas B2B são em memória e reiniciar o backend as remove.
- A aplicação pede consentimento antes de cadastrar pessoa, mas isso não comprova conformidade integral com a LGPD. Retenção, acesso, eliminação, controles operacionais e revisão jurídica ainda precisam ser definidos.
- O cookie de sessão corporativa é HttpOnly e SameSite=Lax; em produção também usa Secure. O estado de sessão é volátil.

## Perguntas frequentes

### Por que Docker Compose?

Compose declara a configuração dos serviços, rede, variáveis e volume em um só lugar, facilitando repetir a demonstração. Isso não significa que todos os módulos do sistema sejam distribuídos ou escaláveis independentemente.

### O que permanece salvo depois de reiniciar?

Cadastros gravados no MySQL permanecem no volume, desde que ele não seja removido. Sessões, contas B2B, chaves e métricas permanecem somente na memória do processo. Avaliações novas têm gravação no banco, mas a aplicação ainda não as recupera ao reiniciar.

### O que é exposto em `GET /api/pessoas`?

Somente o número total e contagens agrupadas por cidade e UF. CPF, nome e endereço individual não são enviados nessa rota.

### As avaliações provam que um local é acessível?

Não. São relatos comunitários, sujeitos a desatualização e sem auditoria independente. Os dados de exemplo são marcados como não verificados e só são carregados fora de produção.

### O produto aceita pagamentos?

Não. Checkout e webhook retornam `501 Not Implemented`. A interface também informa que os planos pagos ainda não podem ser contratados. Não há integração Stripe ativa.

### O que falta antes de produção?

Persistência durável para B2B e avaliações, controles de retenção/eliminação de dados pessoais, gestão de segredos e TLS na implantação, proteção distribuída contra abuso, testes automatizados mais amplos e revisão de segurança, acessibilidade e privacidade.

## Comandos de referência

```powershell
npm run lint
npm run build
npm run test:security
npm run test:api
npm run test:db
```

Consulte [testes e validação](testes-e-validacao.md) e [segurança e privacidade](seguranca-e-privacidade.md) para detalhes e limitações de cada comando.
