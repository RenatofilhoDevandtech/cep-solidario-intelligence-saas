# Segurança e privacidade

Este documento descreve as correções aplicadas no projeto após a revisão de segurança e os limites que continuam presentes. Ele não é uma certificação de segurança nem um parecer jurídico.

## Correções aplicadas

| Risco identificado | Medida aplicada |
|---|---|
| Exposição de CPF, nome e endereço pela listagem pública de pessoas | `GET /api/pessoas` agora retorna apenas contagem total e agregações por município/UF; a resposta usa `Cache-Control: no-store`. |
| Exposição de nomes de autores em avaliações comunitárias | O formulário não solicita o nome do autor e a API grava um identificador anônimo fixo nas novas avaliações. |
| XSS persistente em popups do mapa por conteúdo comunitário | Popups do Leaflet são construídos com elementos DOM e `textContent`, sem interpolar conteúdo comunitário como HTML. |
| Vazamento de logs e métricas B2B entre empresas | Consultas de uso e listagens de chaves recebem o ID da empresa autenticada e filtram os registros por empresa. |
| Elevação de plano/limites sem confirmação de pagamento | O cliente não escolhe o plano ao criar chaves; apenas plano gratuito pode ser selecionado. Planos pagos não são ativados e checkout/webhook retornam `501`. |
| Contas demo com senha conhecida | Contas corporativas pré-configuradas e os atalhos de login demo foram removidos; crie uma conta de teste pelo formulário. |
| Injeção de fórmulas em CSV | Campos que começam com `=`, `+`, `-` ou `@` (inclusive após caracteres de controle) são prefixados com apóstrofo e escapados conforme CSV. |
| Chaves API expostas em listagens ou usadas como credencial demonstrativa | Listagens retornam chaves mascaradas; a chave completa só é apresentada na criação. O testador B2B exige que o usuário cole uma chave válida. |
| Cabeçalho público `x-api-key` usado para atribuir métricas | Consultas CEP públicas são registradas como `public_web`; um visitante não pode escolher o ID de chave usado na métrica. |
| Avaliações de exemplo apresentadas como fatos verificados | Exemplos de acessibilidade só são carregados fora de produção e recebem aviso visível de dado demonstrativo não verificado. Relatos reais são descritos como não auditados. |
| Erros de escrita no MySQL convertidos em aparente sucesso | Falhas de escrita em cadastro, avaliação e confirmação de avaliação são propagadas ao chamador; produção também exige conexão MySQL no startup. |

As verificações automatizadas disponíveis são executadas por `npm run test:security`; consulte [testes e validação](testes-e-validacao.md).

## Tratamento de dados pessoais

- O cadastro de pessoas exige consentimento explícito `termo_lgpd: true`.
- A aplicação grava nome, CPF e endereço na tabela `pessoas` quando o MySQL está ativo.
- A API pública de listagem retorna apenas agregados e não devolve os campos pessoais.
- A interface não mostra CPF/endereço individual na listagem.
- Não use dados reais em demonstrações, screenshots, logs de teste ou ambientes compartilhados.
- O formulário de acessibilidade não coleta nome do autor. Texto livre em comentários ainda pode conter dados identificadores; não inclua dados pessoais nesses relatos.

O consentimento e a agregação são medidas técnicas, mas não estabelecem conformidade completa com a LGPD. Antes de uso real, defina finalidade e base legal, aviso de privacidade, retenção, procedimento para acesso/correção/eliminação, controle de acesso aos dados, backups, resposta a incidentes e revisão jurídica.

## Controles de execução

- Produção não inicializa sem conexão com MySQL.
- O cookie de sessão é `HttpOnly`, `SameSite=Lax` e tem `Secure` em produção.
- Login e cadastro corporativo têm limite de 10 tentativas por 15 minutos; há também limite geral por processo.
- A porta MySQL no Compose é vinculada ao loopback do host (`127.0.0.1`).
- Senhas e segredos devem ser configurados fora do controle de versão. `.env` não deve ser compartilhado.

## Limitações remanescentes

- Empresas, sessões, API keys, limites e logs B2B ficam em memória; reiniciar o processo os remove. Uma implantação com várias instâncias não compartilha esses dados.
- Avaliações são lidas de memória. Embora novas avaliações possam ser gravadas no MySQL, a aplicação ainda não carrega essas avaliações do banco no startup.
- O rate limit também é em memória e pode ser contornado reiniciando o processo ou usando várias instâncias.
- Não há integração de pagamento ativa, validação de assinatura Stripe, persistência B2B durável, processo de retenção/eliminação de PII, nem fluxo de moderação/verificação de avaliações.
- O consentimento LGPD não substitui um processo de governança ou revisão de conformidade.

## Recomendações antes de produção com usuários reais

1. Implementar persistência e migrações para contas, sessões, chaves, métricas e avaliações; carregar os dados persistidos ao iniciar.
2. Adotar armazenamento compartilhado para sessões e rate limit se houver múltiplas instâncias.
3. Criar política de retenção/eliminação e fluxo autenticado de direitos do titular para dados pessoais.
4. Definir moderação, denúncia, data de atualização e mecanismo de verificação dos relatos de acessibilidade.
5. Configurar TLS, rotação e gestão de segredos, backups testados, monitoramento e resposta a incidentes.
6. Antes de ativar cobrança, implementar integração de pagamento real, validação criptográfica de webhooks e mudanças de plano idempotentes.
7. Ampliar testes automatizados de autenticação, autorização, isolamento, privacidade, acessibilidade e implantação.
