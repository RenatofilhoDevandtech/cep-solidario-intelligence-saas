# Guia visual do CEP Solidario

## Direcao

Uma ferramenta publica confiavel, humana e precisa. A interface deve parecer premium pela clareza, espaco e acabamento, nao por excesso de efeitos.

## Cores

- Azul-marinho `#102A43`: confianca, texto principal e superficies de alta importancia.
- Azul `#1261A0`: links, navegacao ativa e acoes de consulta.
- Verde `#35B779`: confirmacao, acessibilidade e estado positivo.
- Amarelo `#E3A008`: atencao e dados pendentes.
- Fundo `#F4F7FB`: base neutra para leitura prolongada.
- Texto secundario `#627D98`: descricoes e metadados.

Nunca usar verde para afirmar acessibilidade quando nao houver avaliacao. Quando nao houver dados, usar linguagem explicita como `Sem dados` ou `Ainda nao avaliado`.

## Tipografia

- Titulos: Outfit, com peso 600 a 800.
- Texto: Plus Jakarta Sans, com peso 400 a 600.
- CEPs, IDs e metricas: fonte monoespaciada apenas quando melhora a leitura.
- Corpo minimo recomendado: 14px em telas pequenas.
- Altura de linha: entre 1.45 e 1.65 para textos corridos.

## Componentes

### Botoes

- Altura minima de 44px em mobile.
- Uma acao primaria por regiao.
- Icone acompanham acoes conhecidas.
- Texto curto e orientado a verbo: `Consultar CEP`, `Confirmar local`, `Compartilhar`.

### Cards

- Raio de 16px para superficies principais.
- Borda sutil e sombra baixa.
- Um card nao deve conter outro card sem necessidade.
- O card do resultado pode usar fundo azul-marinho como momento de destaque.

### Estados

Todo fluxo precisa ter:

- carregando;
- sucesso;
- vazio;
- erro;
- indisponivel ou sem dados.

Nunca apresentar um valor de exemplo como se fosse uma medicao real.

## Responsividade

### Mobile

- Consulta e resultado aparecem antes do mapa.
- Acoes principais ficam ao alcance do polegar.
- Listas podem rolar horizontalmente quando necessario.
- Evitar tabelas largas e textos truncados sem alternativa.
- Navegacao inferior respeita `safe-area-inset-bottom`.

### Tablet

- Usar duas colunas quando houver espaco para comparar resultado e contexto.
- Manter controles com alvos de toque confortaveis.
- Evitar que o mapa ocupe toda a tela sem contexto textual.

### Desktop

- Limitar a largura de leitura.
- Usar mapa e lista lado a lado quando a tarefa exigir comparacao.
- Manter a consulta cidadã separada visualmente das ferramentas B2B.

## Acessibilidade

- Todo controle precisa ter nome acessivel.
- Foco de teclado deve ser visivel.
- Contraste deve ser verificado em texto, bordas e estados.
- Nao depender apenas de cor para comunicar estado.
- Respeitar `prefers-reduced-motion`.
- Permitir aumento de texto sem quebrar o layout.
- Informar fonte, data e nivel de confianca dos dados.

## Performance

- Preferir CSS e componentes existentes antes de novas bibliotecas.
- Evitar efeitos de blur em grandes areas quando nao agregarem significado.
- Carregar dados externos sob demanda.
- Manter imagens com dimensoes estaveis e carregamento tardio.
- Nao cachear respostas sensiveis ou dados dinamicos no service worker sem uma politica clara.
- Medir bundle, tempo de carregamento e consultas externas antes de adicionar integracoes.
