# CEP Solidario: visao de produto, impacto e carreira

## Proposito

O CEP Solidario & Intelligence combina validacao de enderecos, inteligencia para operacoes logísticas e um mapa colaborativo de acessibilidade urbana.

A proposta social e ajudar uma pessoa a descobrir se um destino possui recursos de acessibilidade antes de sair de casa. A proposta corporativa e ajudar empresas a validar CEPs, reduzir falhas de entrega e demonstrar responsabilidade social e ESG.

## Quem pode ser ajudado

- Pessoas com deficiencia motora, visual, auditiva ou neurodivergentes.
- Familiares, cuidadores e profissionais que planejam deslocamentos.
- Comercios e servicos que desejam comunicar e melhorar sua acessibilidade.
- Empresas de logistica e e-commerce que precisam validar enderecos.
- Orgaos publicos e organizacoes que identificam regioes com pouca infraestrutura.

## Promessa principal

> Descubra se um endereco e acessivel antes de sair de casa, com dados de CEP, mapa e confirmacoes da comunidade.

A experiencia deve comecar por uma acao simples: digitar um CEP ou endereco e receber uma resposta clara, confiavel e facil de entender.

## O que falta para ajudar de fato

### Confianca nos dados

- Informar se cada dado e confirmado, estimado ou demonstrativo.
- Exibir a data da ultima confirmacao.
- Mostrar quantas pessoas confirmaram uma informacao.
- Permitir denunciar dados incorretos.
- Evitar prometer cobertura nacional antes de haver dados suficientes.

### Participacao da comunidade

- Permitir que usuarios avaliem um local.
- Aceitar correcoes e fotos enviadas pelos usuarios.
- Usar moderacao para evitar informacoes falsas ou ofensivas.
- Testar o produto com pessoas com deficiencia reais.

### Informacao pratica

Sempre que houver dados, priorizar:

- rampas e entradas acessiveis;
- banheiro adaptado;
- vaga reservada;
- elevador;
- piso tatil e recursos para pessoas cegas;
- Libras e recursos para pessoas surdas;
- espaco calmo para pessoas com TEA;
- horario de funcionamento e contato;
- data da ultima verificacao.

## O que pode chamar a atencao do publico

- Uma pagina inicial direta com o campo `Digite um CEP ou endereco`.
- Um resultado visual forte para cada CEP.
- Um botao evidente para confirmar ou avaliar o local.
- Um mapa focado inicialmente em uma cidade ou regiao com dados reais.
- Um video curto mostrando uma busca completa.
- Historias reais de uso, sem inventar metricas.
- Contraste, navegacao por teclado, leitor de tela e linguagem simples.

Fotos de ruas podem enriquecer os cards, mas nao sao o primeiro requisito. Antes delas, e mais importante que a informacao seja verdadeira, atualizada e util. Google Street View pode exigir API, faturamento e gerar custo conforme o uso. Mapillary pode reduzir o custo inicial, mas tem cobertura irregular e regras de uso. Imagens proprias e contribuicoes da comunidade sao alternativas importantes.

## Estado atual e limites conhecidos

O projeto ja demonstra:

- validacao de CEP com fallback;
- mapa nacional e busca local;
- filtros de acessibilidade;
- ranking por estado;
- API e fluxo B2B;
- interface com foco em acessibilidade;
- estrutura para Docker e futuras integracoes.

Pontos que devem ser comunicados com honestidade:

- parte dos dados de acessibilidade ainda e mantida em memoria;
- dados em memoria podem ser perdidos quando o backend reinicia;
- imagens de ruas nao devem ser adicionadas sem avaliar custo, cobertura e licenca;
- checkout e algumas integracoes ainda sao demonstrativos;
- a cobertura real deve ser medida antes de divulgar numeros.

## Como transformar o projeto em portifolio profissional

O projeto deve ser apresentado como um estudo de caso, e nao apenas como uma aplicacao bonita.

Mostrar:

1. O problema social e operacional.
2. Quem e afetado.
3. A solucao e o fluxo principal.
4. A arquitetura frontend e backend.
5. APIs, cache, fallback, seguranca e mapa.
6. Decisoes de acessibilidade.
7. Limites atuais e proximos passos.
8. Link de demonstracao e repositorio organizado.

Descricao curta para curriculo ou LinkedIn:

> Desenvolvi uma plataforma de inteligencia de CEP e acessibilidade urbana com React, TypeScript, API REST, mapa georreferenciado, validacao resiliente de enderecos e filtros para diferentes necessidades de acessibilidade.

O projeto pode ser usado para candidaturas de frontend, full stack, backend, produto digital com impacto social e tecnologia civica.

## Plano de prioridade

### Fase 1: foco

- Escolher o publico principal para a primeira versao.
- Escolher uma cidade ou regiao para validar a proposta.
- Definir o fluxo principal: buscar CEP, entender o resultado e contribuir.

### Fase 2: confianca

- Diferenciar dados reais e demonstrativos.
- Adicionar ultima atualizacao e fonte.
- Criar fluxo de avaliacao, correcao e moderacao.
- Validar a experiencia com usuarios com deficiencia.

### Fase 3: distribuicao

- Publicar uma demonstracao funcional.
- Criar video curto e imagens do produto.
- Compartilhar em comunidades de acessibilidade, tecnologia civica, logistica e desenvolvimento.
- Conversar com instituicoes, comercios e empresas locais.

### Fase 4: carreira

- Organizar README, screenshots e demonstracao.
- Escrever o estudo de caso.
- Adicionar o projeto ao curriculo com resultados verificaveis.
- Preparar uma apresentacao de cinco minutos para entrevistas.
- Direcionar candidaturas para vagas coerentes com a parte mais forte do projeto.

## Principio de trabalho

O objetivo nao e adicionar funcionalidades indefinidamente. O objetivo e fazer uma pessoa conseguir tomar uma decisao melhor sobre um deslocamento e conseguir provar, para uma empresa, que voce sabe transformar um problema real em software utilizavel.
