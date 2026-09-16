# Arquitetura da informacao e visao de tech lead

## Objetivo do produto

O produto deve permitir que uma pessoa ou empresa transforme um endereco em uma decisao melhor:

- uma pessoa entende se pode chegar a um local com mais previsibilidade;
- uma empresa reduz erros de endereco e melhora a experiencia de entrega;
- uma comunidade registra e confirma barreiras de acessibilidade.

A regra de produto e simples: confiabilidade e utilidade valem mais do que quantidade de funcionalidades.

## Organizacao da informacao

```text
Produto
├── Consulta de CEP
│   ├── Busca por CEP ou endereco
│   ├── Resultado cadastral
│   ├── Indicadores de consistencia
│   └── Acao para copiar, compartilhar ou abrir o mapa
├── Acessibilidade urbana
│   ├── Mapa nacional
│   ├── Busca por raio local
│   ├── Ranking por estado
│   ├── Filtros por necessidade
│   ├── Lista de locais
│   └── Avaliacoes e confirmacoes
├── Area corporativa
│   ├── Autenticacao
│   ├── API keys
│   ├── Validacao individual
│   ├── Validacao em lote
│   ├── Metricas de uso
│   └── Planos e checkout demonstrativo
└── Confianca e suporte
    ├── Fonte do dado
    ├── Data da verificacao
    ├── Estado da integracao
    ├── Privacidade
    └── Relato de problemas
```

## Fluxos principais

### Fluxo cidadadao

```text
Entrada: CEP ou localizacao
  -> Validacao do endereco
  -> Leitura do resultado
  -> Consulta do mapa ou detalhes do local
  -> Decisao de deslocamento
  -> Confirmacao ou correcao pela comunidade
```

### Fluxo corporativo

```text
Entrada: CEP individual ou lote
  -> Autenticacao e API key
  -> Validacao com fallback
  -> Normalizacao e score
  -> Resposta ou exportacao
  -> Monitoramento de uso e erros
```

### Fluxo de confianca

```text
Dado recebido
  -> Identificacao da fonte
  -> Validacao de formato
  -> Registro de atualizacao
  -> Exibicao do nivel de confianca
  -> Feedback ou correcao
```

## Limites de responsabilidade

### Frontend

Responsavel por:

- apresentar o fluxo de consulta;
- garantir navegacao clara e acessivel;
- exibir estados de carregamento, erro e vazio;
- controlar filtros e interacoes do mapa;
- nao esconder a origem ou a incerteza dos dados.

### Backend

Responsavel por:

- validar entradas;
- consultar fontes externas;
- executar fallback e cache;
- proteger rotas corporativas;
- aplicar limites de uso;
- normalizar respostas;
- evitar que credenciais aparecam no navegador.

### Persistencia

Responsavel por:

- guardar avaliacoes e confirmacoes;
- registrar historico de alteracoes;
- manter usuarios e empresas;
- permitir auditoria e moderacao;
- suportar recuperacao apos reinicio.

Na versao atual, parte dessa responsabilidade ainda usa memoria de processo. Isso deve ser tratado como limitacao conhecida, nao como persistencia de producao.

## Principios tecnicos

1. **Fonte explicita:** toda informacao externa deve ter origem identificavel.
2. **Falha controlada:** uma fonte indisponivel deve produzir uma resposta compreensivel, nao dados silenciosamente incorretos.
3. **Privacidade por padrao:** chaves, senhas, localizacao e dados pessoais nao devem ser expostos sem necessidade.
4. **Acessibilidade como requisito:** teclado, contraste, foco, semantica e leitor de tela fazem parte da funcionalidade.
5. **Observabilidade:** erros, latencia, uso de fallback e consultas devem ser mensuraveis.
6. **Evolucao incremental:** cada nova integracao deve ter custo, cobertura, licenca e plano de fallback avaliados.

## Prioridades de tech lead

### P0: confianca e funcionamento

- separar dados reais, estimados e demonstrativos;
- persistir avaliacoes e confirmacoes;
- tratar estados de erro, vazio e carregamento;
- validar entradas e escapar conteudo exibido;
- remover credenciais demonstrativas antes de um ambiente publico;
- criar testes para consulta de CEP, fallback e filtros do mapa.

### P1: experiencia do usuario

- tornar a busca de CEP o caminho principal;
- melhorar a apresentacao do resultado;
- registrar data da ultima confirmacao;
- criar fluxo simples de avaliacao;
- testar com pessoas com deficiencia;
- medir buscas concluidas, erros e contribuicoes.

### P2: escala e negocio

- trocar repositorios em memoria por adapters de banco;
- usar cache compartilhado quando necessario;
- definir limites por cliente e observabilidade;
- documentar API e exemplos de integracao;
- avaliar fotos de ruas somente depois de validar custo, licenca e cobertura;
- separar claramente produto social e produto B2B na comunicacao.

## Riscos e decisoes

| Risco | Impacto | Resposta de lideranca tecnica |
|---|---|---|
| Dado de acessibilidade incorreto | Alto | Fonte, data, confirmacao comunitaria e moderacao |
| Dependencia de API externa | Alto | Timeout, fallback, cache e monitoramento |
| Custo de imagens de rua | Medio/alto | Fazer piloto limitado e medir volume antes |
| Dados perdidos no reinicio | Alto | Implementar persistencia e backup |
| Cobertura nacional baixa | Medio | Comecar por uma regiao com dados reais |
| Uso indevido de credenciais | Alto | Variaveis de ambiente, rotacao e nunca enviar ao frontend |
| Funcionalidades demais | Medio | Priorizar o fluxo de consulta e contribuicao |

## Criterios de pronto

Uma funcionalidade so deve ser considerada pronta quando:

- tem objetivo e usuario definidos;
- funciona no estado de sucesso;
- possui estado de carregamento, vazio e erro;
- funciona em tela pequena e teclado;
- nao expoe segredo ou dado pessoal desnecessario;
- possui teste ou verificacao manual documentada;
- informa limites e fonte do dado;
- nao aumenta custo externo sem uma decisao registrada.

## Estrategia de entrega

1. Publicar uma demonstracao pequena e confiavel.
2. Escolher uma cidade ou regiao para obter dados reais.
3. Conversar com usuarios e instituicoes locais.
4. Medir buscas, retornos, correcoes e avaliacoes.
5. Corrigir o caminho principal antes de adicionar novas integracoes.
6. Transformar resultados reais em estudo de caso profissional.

## Como apresentar o projeto profissionalmente

A narrativa para recrutadores deve mostrar julgamento tecnico, nao apenas telas:

- problema concreto;
- impacto para pessoas e empresas;
- arquitetura e limites;
- resiliencia de integracoes;
- acessibilidade aplicada;
- seguranca e privacidade;
- metricas verificaveis;
- decisoes que foram adiadas por custo ou risco.

A visao de tech lead deste projeto e construir confianca antes de escala: primeiro uma experiencia pequena que funciona e ajuda alguem; depois persistencia, cobertura, integracoes e crescimento sustentavel.
