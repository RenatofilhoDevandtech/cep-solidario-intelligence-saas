# CEP Solidario: pros, contras e solucoes

## Objetivo

O CEP Solidario pode ajudar pessoas a entender se um endereco possui recursos de acessibilidade antes de um deslocamento. Tambem pode ajudar familiares, cuidadores, empresas, escolas, clinicas, comercios e orgaos publicos.

A aplicacao deve ser tratada como uma ferramenta de apoio a decisao, e nao como uma garantia absoluta de que um local e acessivel.

## Beneficios e oportunidades

### Para pessoas com deficiencia

- Consultar informacoes antes de sair de casa.
- Encontrar rampas, banheiros adaptados, vagas e elevadores.
- Verificar piso tatil, recursos em Libras, sinalizacao sonora e espacos calmos.
- Compartilhar um resultado com familiar, cuidador ou responsavel.
- Contribuir com avaliacoes e correcoes.
- Planejar deslocamentos com mais previsibilidade.

### Para familiares e responsaveis

- Pesquisar um local em nome da pessoa que ira utiliza-lo.
- Comparar informacoes antes de marcar uma consulta, visita ou compromisso.
- Ter uma referencia centralizada para planejar o deslocamento.
- Compartilhar o endereco e os recursos encontrados.

### Para empresas e instituicoes

- Reduzir erros de enderecamento e falhas de entrega.
- Melhorar a experiencia de clientes com necessidades diferentes.
- Identificar barreiras de acessibilidade nos seus locais.
- Demonstrar responsabilidade social com dados e acoes verificaveis.
- Apoiar decisoes de infraestrutura e atendimento.

### Para a comunidade

- Registrar barreiras que nem sempre aparecem em mapas comuns.
- Criar um historico colaborativo de melhorias.
- Dar visibilidade a locais que precisam de adaptacao.
- Produzir dados para iniciativas de tecnologia civica e politicas publicas.

## Contras, riscos e limitacoes

### Exclusao digital

Nem todas as pessoas possuem celular, internet, computador ou familiaridade com tecnologia. Algumas dependem de um responsavel, cuidador ou instituicao para realizar a consulta.

### Dados incorretos

Uma informacao desatualizada pode levar uma pessoa a um local que nao atende sua necessidade. Uma rampa pode existir, mas estar bloqueada, inclinada demais ou sem uma entrada adequada.

### Cobertura limitada

A ausencia de um local no mapa nao significa que ele nao seja acessivel. Pode significar apenas que ainda nao foi cadastrado ou avaliado.

### Dependencia de APIs externas

Servicos de CEP, mapas, geolocalizacao e imagens podem falhar, mudar de politica, impor limites ou gerar custos.

### Custo de imagens de ruas

Google Street View pode exigir API key, faturamento e cobranca conforme o volume de uso. Mapillary pode reduzir o custo inicial, mas tem cobertura irregular, limites e regras de licenca. Imagens proprias exigem autorizacao, armazenamento e moderacao.

### Privacidade

Localizacao, fotos, avaliacoes e dados de contato podem revelar informacoes pessoais ou sensiveis.

### Representacao inadequada

Um responsavel pode avaliar um local sem representar a experiencia da pessoa que realmente possui a deficiencia. Uma unica avaliacao tambem pode nao servir para todas as necessidades.

### Dependencia de participacao

O produto precisa de usuarios, instituicoes e estabelecimentos para gerar dados atuais. Sem contribuicoes, o mapa pode ficar vazio ou desatualizado.

### Dados perdidos na versao atual

Parte das avaliacoes e informacoes de acessibilidade ainda pode ser mantida em memoria. Um reinicio do backend pode causar perda desses dados enquanto a persistencia definitiva nao estiver implementada.

### Excesso de funcionalidades

Mapa nacional, ranking, B2B, checkout, fotos e filtros podem tornar o produto confuso e esconder a acao mais importante: consultar um endereco e entender se ele atende a uma necessidade.

## Solucoes recomendadas

### 1. Resolver a confiabilidade dos dados

- Exibir a fonte de cada informacao.
- Mostrar a data da ultima verificacao.
- Diferenciar `confirmado`, `nao confirmado`, `estimado` e `demonstrativo`.
- Mostrar quantas pessoas confirmaram o dado.
- Permitir corrigir ou denunciar uma informacao.
- Criar moderacao para fotos e avaliacoes.
- Nunca afirmar acessibilidade total com base em apenas um indicador.

Exemplo de comunicacao:

> Entrada com rampa confirmada por 3 pessoas em junho de 2026. Banheiro adaptado ainda nao verificado.

### 2. Resolver a exclusao digital

- Oferecer uma aplicacao web leve, sem exigir instalacao.
- Garantir uso em computador e celular.
- Permitir imprimir ou baixar o resultado.
- Permitir compartilhar um link simples.
- Criar uma visualizacao para familiares e responsaveis.
- Buscar parcerias com escolas, clinicas, associacoes e centros de atendimento.
- Considerar futuramente consulta por telefone, WhatsApp ou pontos de apoio.
- Usar linguagem simples, alto contraste, teclado e leitor de tela.

### 3. Resolver a falta de cobertura

- Comecar por uma cidade ou regiao com dados reais.
- Trabalhar com instituicoes locais para cadastrar os primeiros pontos.
- Mostrar o nivel de cobertura verdadeiro.
- Nao divulgar numeros inventados.
- Exibir uma mensagem clara quando nao houver dados.
- Criar campanhas locais de confirmacao.

Mensagem recomendada:

> Ainda nao temos informacoes suficientes sobre este local. Voce pode contribuir com uma avaliacao.

### 4. Resolver a dependencia de servicos externos

- Usar timeout para chamadas externas.
- Implementar fallback entre fontes de CEP.
- Aplicar cache para consultas repetidas.
- Monitorar latencia, erros e uso de cada fonte.
- Mostrar uma resposta compreensivel quando todas as fontes falharem.
- Avaliar custo e limite antes de disponibilizar uma integracao em grande escala.

### 5. Resolver o custo de imagens

As imagens nao devem ser a primeira prioridade. Primeiro, a informacao precisa ser verdadeira, atualizada e util.

Ordem recomendada:

1. Comecar sem imagens ou com imagens proprias autorizadas.
2. Fazer um piloto limitado por cidade.
3. Comparar custo, cobertura e licenca entre Google Street View, Mapillary e outras fontes.
4. Carregar imagens somente quando o usuario abrir o detalhe do local.
5. Usar cache quando permitido pelos termos da fonte.
6. Exibir atribuicao e respeitar as regras de uso.
7. Criar fallback visual quando nao houver imagem.

### 6. Resolver os riscos de privacidade

- Nao armazenar localizacao sem necessidade.
- Solicitar permissao somente quando o usuario escolher a busca local.
- Nao coletar documentos ou dados pessoais em avaliacoes.
- Remover informacoes sensiveis de fotos.
- Proteger sessoes, senhas e API keys no backend.
- Nunca enviar chaves privadas para o navegador.
- Criar uma politica de privacidade simples e visivel.

### 7. Resolver a representacao inadequada

- Convidar pessoas com diferentes deficiencias para testar o produto.
- Permitir que a avaliacao informe qual necessidade foi considerada.
- Separar avaliacao pessoal de informacao oficial do estabelecimento.
- Permitir varias perspectivas para o mesmo local.
- Evitar que uma nota unica represente todas as deficiencias.

### 8. Resolver a falta de persistencia

- Implementar banco de dados para avaliacoes, confirmacoes e usuarios.
- Registrar historico de alteracoes.
- Criar moderacao e auditoria.
- Fazer backup e testar recuperacao.
- Migrar os repositorios em memoria por adapters de persistencia.

### 9. Resolver o excesso de funcionalidades

O fluxo principal deve ser:

```text
Digite o CEP ou endereco
  -> Veja o endereco
  -> Veja os recursos de acessibilidade
  -> Confira fonte e data
  -> Compartilhe ou confirme
```

Ranking, fotos, B2B e checkout devem apoiar esse fluxo, e nao competir com ele.

## Como tornar o produto mais impactante

### Impacto pratico

O produto se torna relevante quando ajuda alguem a tomar uma decisao concreta:

> Posso chegar a este local com mais seguranca e previsibilidade?

A resposta deve ser clara, mas tambem honesta sobre as incertezas.

### Impacto mensuravel

Acompanhar metricas reais:

- buscas de CEP concluidas;
- resultados compartilhados;
- locais avaliados;
- dados corrigidos;
- confirmacoes da comunidade;
- instituicoes participantes;
- usuarios que retornaram ao produto;
- tempo para encontrar uma informacao;
- erros de fonte e tempo de resposta.

Nao afirmar que o projeto ajudou milhares de pessoas sem evidencia. Um piloto pequeno e verificavel e mais confiavel.

Exemplo:

> Em um piloto com 20 locais, 14 receberam confirmacao comunitaria e 5 informacoes foram corrigidas.

### Impacto humano

Conversar com:

- pessoas com deficiencia;
- familiares e cuidadores;
- escolas inclusivas;
- clinicas de reabilitacao;
- associacoes locais;
- estabelecimentos e servicos publicos.

Perguntas importantes:

- Que informacao voce precisa antes de sair?
- O que costuma estar errado nos mapas?
- Voce prefere texto, audio, imagem ou impressao?
- Quem normalmente pesquisa por voce?
- O que faria voce confiar neste resultado?

## Ordem de implementacao

### Prioridade imediata

- Confiabilidade dos dados.
- Busca por CEP simples e clara.
- Estados de erro, vazio e carregamento.
- Fonte e data da informacao.
- Compartilhamento do resultado.
- Acessibilidade real da interface.
- Piloto em uma cidade ou regiao.

### Segunda prioridade

- Avaliacoes e confirmacoes.
- Moderacao.
- Persistencia em banco.
- Metricas de impacto.
- Parcerias com instituicoes.
- Documentacao da API.

### Terceira prioridade

- Fotos de ruas em escala.
- Expansao nacional.
- Recursos B2B avancados.
- Monetizacao complexa.
- Novas integracoes externas.

## Mensagem central do projeto

O CEP Solidario nao deve ser apenas um mapa bonito ou uma demonstracao de tecnologia. Seu valor esta em ajudar uma pessoa, um familiar ou um cuidador a tomar uma decisao melhor sobre um deslocamento.

> Nao basta localizar um endereco. E preciso ajudar alguem a decidir se consegue chegar ate ele.
