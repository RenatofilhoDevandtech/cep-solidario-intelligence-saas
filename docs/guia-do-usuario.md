# Guia do usuario

## O que e o CEP Solidario

O CEP Solidario e uma plataforma para consultar enderecos, validar CEPs e encontrar informacoes colaborativas sobre acessibilidade urbana.

A plataforma atende dois usos principais:

- consulta cidadã de enderecos e acessibilidade;
- validacao de enderecos e integracao para empresas.

## Consulta de um CEP

1. Abra a tela principal.
2. Digite o CEP no campo de busca.
3. Aguarde a validacao do endereco.
4. Confira logradouro, bairro, cidade, estado e indicadores disponiveis.
5. Use o resultado para confirmar se o endereco esta correto antes de fazer uma entrega ou planejar um deslocamento.

Quando uma fonte externa estiver indisponivel, o sistema pode consultar fontes alternativas. Mesmo assim, confirme informacoes importantes antes de tomar uma decisao critica.

## Leitura do resultado

Observe principalmente:

- CEP e endereco formatado;
- cidade e estado;
- nivel de confianca ou consistencia cadastral;
- qualidade ou risco de entrega, quando disponivel;
- informacoes de acessibilidade;
- data da ultima atualizacao;
- fonte e quantidade de confirmacoes.

Informacoes demonstrativas ou sem confirmacao comunitaria nao devem ser tratadas como garantia de acessibilidade.

## Uso do mapa de acessibilidade

1. Abra a area de mapa.
2. Escolha `Mapa do Brasil` para uma visao nacional ou `Modo Raio Local` para consultar uma regiao.
3. Use `Minha Localizacao` somente se desejar permitir o acesso a localizacao do navegador.
4. Selecione um raio local quando estiver usando a busca por proximidade.
5. Clique em um estado para filtrar os pontos mapeados.
6. Use os filtros conforme a necessidade: rampa, elevador, banheiro adaptado, vaga, piso tatil, Libras, sinal sonoro e espaco calmo.
7. Clique em um ponto do mapa ou em um item da lista para ver seus detalhes.

O mapa mostra locais cadastrados, mas a ausencia de um ponto nao significa que a cidade ou o estabelecimento nao seja acessivel.

## Como avaliar um local

Antes de enviar uma avaliacao:

- visite ou conheca diretamente o local;
- descreva somente o que foi observado;
- diferencie experiencia pessoal de informacao ouvida de terceiros;
- evite publicar dados pessoais;
- inclua detalhes praticos e objetivos;
- informe quando a observacao foi realizada.

Uma boa avaliacao responde: qual recurso existe, onde ele esta, em que condicao se encontra e para qual necessidade ele ajuda.

## Privacidade e seguranca

- Nao compartilhe senhas, tokens ou chaves de API.
- Nao envie documentos pessoais nas avaliacoes.
- Revise uma avaliacao antes de publica-la.
- A localizacao do navegador so deve ser autorizada quando for necessaria para a busca local.
- Nao use dados do sistema como garantia medica, legal ou de seguranca sem verificacao adicional.

## Para empresas

Empresas podem usar a validacao de CEP para reduzir erros de endereco, consultar lotes e integrar a API. Acesso corporativo, chaves e limites devem ser tratados como credenciais sensiveis.

Antes de usar em producao:

- configure uma chave propria;
- valide limites e custos das fontes externas;
- monitore erros e tempo de resposta;
- confirme a politica de retencao de dados;
- teste o comportamento quando uma fonte estiver indisponivel.

## Problemas conhecidos

O mapa e as avaliacoes podem ter cobertura limitada. Alguns dados sao mantidos em memoria na versao atual e podem ser perdidos quando o backend reinicia. Imagens de ruas e dados de terceiros dependem de cobertura, licenca, disponibilidade e custos da fonte.

## Como pedir ajuda

Ao relatar um problema, informe:

- o que tentou fazer;
- qual tela ou fluxo usou;
- CEP ou cidade de exemplo, sem dados pessoais;
- mensagem de erro exibida;
- data e horario aproximados;
- navegador e dispositivo.
