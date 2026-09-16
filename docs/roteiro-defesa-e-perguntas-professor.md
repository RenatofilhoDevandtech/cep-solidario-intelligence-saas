# 🎓 Minhas Anotações de Defesa e Apresentação do Projeto

> **Meu Projeto:** CEP Solidário & Intelligence SaaS  
> **Objetivo Acadêmico:** Arquitetura Multi-Container com Docker Compose, Comunicação entre Serviços (API REST) e Persistência de Dados em Volume Relacional (MySQL 8).  
> **Autor:** Renato Filho (RenatofilhoDevandtech)

---

## 🎙️ 1. Meu Pitch Inicial (O que eu vou falar para o professor na abertura)

*"Boa noite, professor!*

*Para o desenvolvimento deste trabalho, decidi não criar apenas um formulário básico sem propósito, mas sim resolver um problema real do nosso país com uma arquitetura de software profissional.*

*No Brasil, milhões de pessoas enfrentam grandes barreiras de acesso a serviços públicos, entregas e correspondências por causa de endereços imprecisos ou falta de informações de acessibilidade urbana. Para solucionar isso e cumprir rigorosamente todos os requisitos da disciplina, eu desenvolvi o **CEP Solidário & Intelligence**.*

*Eu estruturei o projeto dividindo a aplicação em **três containers independentes** orquestrados pelo **Docker Compose**:*
1. *O **Frontend**, feito em React com Vite e servido via Nginx;*
2. *O **Backend**, uma API REST em Node.js com Express e TypeScript;*
3. *E o **Banco de Dados Relacional**, utilizando a imagem oficial do MySQL 8 com um volume persistente chamado `mysql_data`.*

*Na prática, o usuário só precisa preencher os dados pessoais básicos: Nome, CPF, CEP e o Número do imóvel. O meu backend se encarrega de consultar a API de CEP em tempo real, preencher sozinho o Logradouro, Bairro, Localidade, UF e Estado por extenso, e gravar tudo de forma durável no MySQL, respeitando as diretrizes da LGPD.*

*Agora, professor, quero te mostrar a estrutura do meu `docker-compose.yml`, como os containers conversam na rede interna e fazer o teste ao vivo de persistência do volume."*

---

## 🏗️ 2. Como eu Estruturei a Arquitetura (Minha Explicação Técnica Detalhada)

Aqui estão as minhas anotações para explicar cada decisão técnica que tomei no código:

### 🐳 2.1. Meus 3 Containers Obrigatórios
*Para garantir o desacoplamento e o isolamento dos ambientes, separei o sistema em três containers:*

1. **`cep_solidario_frontend` (Frontend)**:
   - **O que usei:** React 19, Vite e Tailwind CSS, empacotados com servidor Nginx no `Dockerfile.frontend`.
   - **O que ele faz:** Renderiza a interface visual limpa, rápida e responsiva para o cadastro e listagem.
   - **Porta:** Mapeei a porta `3000:3000` para que qualquer pessoa acerte no navegador em `http://localhost:3000`.

2. **`cep_solidario_backend` (API REST)**:
   - **O que usei:** Node.js 20, Express e TypeScript no `Dockerfile.backend`.
   - **O que ele faz:** Processa as requisições, valida CPF e dados obrigatórios, executa a busca e auto-completar de CEP e gerencia a conexão com o banco MySQL via pool.
   - **Porta:** Roda na porta interna `5000` e mapeia `5000:5000`.

3. **`cep_solidario_mysql` (Banco de Dados Relacional)**:
   - **O que usei:** Imagem oficial `mysql:8.0`.
   - **O que ele faz:** Guarda as tabelas relacionais de pessoas cadastradas e seus respectivos endereços estruturados.
   - **Porta:** Porta `3306:3306`.
   - *(Bônus que adicionei)*: Subi também um container do Redis (`cep_solidario_redis`) na porta `6379` para controle de cache e limitação de taxa (rate limiting).

---

### 🌐 2.2. Como fiz meus containers conversarem (Docker Network)
*Para conectar os containers sem depender de configurações manuais:*

* Criei no `docker-compose.yml` uma rede própria do tipo bridge chamada **`cep_network`**.
* Conectei os três serviços (`frontend`, `backend` e `db`) dentro dessa mesma rede.
* Aproveitei o **DNS interno do Docker**: eu não preciso colocar IPs fixos como `172.x.x.x` no meu código. O backend encontra o banco simplesmente usando o hostname do serviço: **`host: 'db'`**.
* O frontend Nginx recebe as requisições do usuário e repassa para `http://backend:5000/api` de forma transparente.

---

### 💾 2.3. Como garanti que os dados não somem (Volume do Docker)
*Esta foi uma das partes mais importantes que implementei:*

* Eu sei que o sistema de arquivos padrão de um container é temporário. Se o container do MySQL for apagado, os dados normais seriam perdidos.
* Por isso, configurei no Compose um **volume nomeado**:
  ```yaml
  volumes:
    - mysql_data:/var/lib/mysql
  ```
* O diretório `/var/lib/mysql` (onde o MySQL grava fisicamente as tabelas do InnoDB) fica salvo no disco do host gerenciado pelo Docker.
* **O que isso significa na prática:** se eu derrubar e deletar o container com `docker compose rm -f -s db` e subir novamente com `docker compose up -d db`, um novo container é criado, ele remonta o volume `mysql_data` e todas as pessoas cadastradas continuam salvas lá, sem perder nada!

---

### 🔌 2.4. Como construí a API REST (Meus Endpoints POST e GET)
*No meu arquivo `server.ts`, criei as duas rotas principais solicitadas:*

1. **`POST /api/pessoas` (Cadastro com Auto-Completar)**:
   - **Dados que o usuário preenche no Frontend:** `nome`, `cpf`, `cep`, `numero`, `complemento`.
   - **O que o meu Backend faz nos bastidores:**
     - Valida se os campos obrigatórios vieram preenchidos.
     - Consulta a API de CEP e recupera: `logradouro`, `bairro`, `localidade` (cidade), `uf`, `estado` (nome completo por extenso) e `rua`.
     - Grava tudo junto na tabela `pessoas` do MySQL.
     - Retorna o código HTTP **`201 Created`** com o objeto completo e o ID gerado.

2. **`GET /api/pessoas` (Listagem)**:
   - Faz um `SELECT * FROM pessoas ORDER BY created_at DESC` no banco.
   - Retorna o array em formato JSON com status HTTP **`200 OK`**.
   - O frontend consome essa rota e monta a tabela em tempo real com busca instantânea.

---

### ⚡ 2.5. A inteligência de CEP que implementei (Resiliência e Fallback)
*Eu não quis depender de apenas uma fonte de CEP que pudesse cair:*
* No meu arquivo `server/cepService.ts`, criei uma estratégia com múltiplos provedores:
  1. Primeiro tento buscar no **ViaCEP**;
  2. Se o ViaCEP demorar ou der erro, o backend redireciona automaticamente na mesma chamada para a **BrasilAPI**;
  3. E caso ambos falhem, o usuário ainda consegue digitar o endereço manualmente sem travar o envio.

---

### 🔒 2.6. Como tratei a LGPD (Lei Geral de Proteção de Dados)
*Pensando em conformidade legal real:*
* Coloquei o checkbox de autorização formal com os termos da LGPD antes do cadastro.
* Na tabela pública, protejo o CPF do cidadão exibindo-o mascarado por padrão (`***.456.789-**`), e criei um botão para alternar e ver o CPF completo quando for necessário auditar.

---

### 🛡️ 2.7. Minha camada de contingência (Fallback em Memória)
*Para o caso de alguém rodar o projeto sem o Docker Desktop aberto no momento:*
* No meu arquivo `server/db.ts`, programei um fallback inteligente: se o container do MySQL não responder, o servidor avisa no console e mantém uma camada em memória com registros de exemplo. A API continua respondendo e nunca quebra na cara do usuário.

---

## ❓ 3. Perguntas que o Professor vai me fazer (e como eu vou responder na lata!)

Aqui reuni as perguntas mais prováveis que o professor pode me fazer durante a arguição, com as respostas exatas que eu vou dar:

---

### ❓ Pergunta 1: *"Por que você usou Docker Compose e não subiu tudo na mão com comandos docker run?"*
> **Minha Resposta:**  
> *"Professor, subir com `docker run` na mão é muito trabalhoso e propício a erro humano, porque eu teria que decorar e digitar no terminal vários comandos com parâmetros de rede, portas, variáveis de ambiente e volumes na ordem exata toda vez.*  
> *Com o **Docker Compose**, toda a minha infraestrutura fica declarada em um único arquivo de configuração (`docker-compose.yml`). Com um único comando — `docker compose up -d` —, qualquer pessoa sobe meus 3 containers configurados, na rede certa e com o volume montado em segundos."*

---

### ❓ Pergunta 2: *"Como o seu backend consegue achar o banco pelo nome 'db' se você não configurou nenhum IP fixo?"*
> **Minha Resposta:**  
> *"Isso acontece graças ao **DNS interno do Docker Engine**. Quando dois ou mais containers estão conectados na mesma rede do tipo bridge (a nossa `cep_network`), o Docker faz o Service Discovery automático.*  
> *O nome do serviço no Compose (`db:`) vira um hostname na rede. Quando meu backend em Node.js tenta conectar em `host: 'db'`, o próprio Docker resolve esse nome para o IP interno temporário do container do MySQL."*

---

### ❓ Pergunta 3: *"Se eu rodar `docker compose down`, meus dados salvos são apagados? E se eu passar a flag `-v`?"*
> **Minha Resposta:**  
> *(Essa é a clássica pegadinha de professor!)*  
> *"Se você rodar só `docker compose down`, os containers e a rede são destruídos, **mas os volumes NÃO são apagados**. O volume `mysql_data` continua intacto no disco com todas as pessoas cadastradas.*  
> *Agora, se você rodar explicitamente `docker compose down -v` (com a flag `--volumes`), aí sim o Docker entende que é para apagar também os volumes de dados, limpando o banco."*

---

### ❓ Pergunta 4: *"Como você fez a rota POST preencher campos que o usuário não digitou?"*
> **Minha Resposta:**  
> *"No meu `POST /api/pessoas`, o frontend envia apenas o que o usuário preencheu (Nome, CPF, CEP, Número e Complemento). O backend intercepta essa requisição, pega o CEP e faz uma chamada assíncrona para a API de CEP.*  
> *Com a resposta em mãos, ele extrai o Logradouro, Bairro, Cidade, UF e o Estado por extenso, junta tudo em um único registro e grava no MySQL. Assim o usuário digita menos e o banco armazena o endereço padronizado e auditado."*

---

### ❓ Pergunta 5: *"Por que você escolheu React, Node.js e MySQL para este projeto?"*
> **Minha Resposta:**  
> *"Eu escolhi esse stack por três motivos principais:*  
> 1. *O **React com Vite** me permitiu criar uma Single Page Application rápida, moderna e modular;*  
> 2. *O **Node.js com TypeScript** me deu segurança de tipos (Type Safety) ponta a ponta, compartilhando as interfaces dos dados entre o servidor e o cliente;*  
> 3. *E o **MySQL 8 com InnoDB** garante integridade referencial, transações ACID e suporte a índices no CPF e CEP, que é o padrão da indústria para dados cadastrais relacionais."*

---

### ❓ Pergunta 6: *"O que faz aquele arquivo `init.sql` no seu repositório?"*
> **Minha Resposta:**  
> *"O `init.sql` está mapeado no volume `/docker-entrypoint-initdb.d/init.sql` do container do MySQL.*  
> *A imagem oficial do MySQL executa esse script automaticamente na primeira inicialização do container. Ele cria o banco `cepsolidario_db`, a tabela `pessoas` com todos os campos e índices, e já insere dados iniciais de teste (seeds) para que o sistema não abra vazio."*

---

## 🎬 4. Meu Roteiro Prático de Apresentação (Passo a Passo ao Vivo)

Este é o roteiro prático que eu vou seguir na frente do professor:

### 1º Passo: Mostrar o arquivo `docker-compose.yml`
* Abro o arquivo `docker-compose.yml` no VS Code.
* Mostro com o mouse os 3 serviços principais:
  - `frontend` (na porta 3000)
  - `backend` (na porta 5000)
  - `db` (MySQL na porta 3306 com o volume `mysql_data`)
  - A rede `cep_network` no rodapé do arquivo.

### 2º Passo: Mostrar os containers rodando no terminal
* Abro o terminal e executo:
  ```bash
  docker compose ps
  ```
* Mostro os containers ativos com status `Up` ou `healthy`.

### 3º Passo: Fazer um cadastro novo ao vivo no navegador
* Abro a aplicação em `http://localhost:3000`.
* Clico na aba **"Pessoas & Endereços"**.
* Digito:
  - Nome: *"Mariana Silva"*
  - CPF: *"123.456.789-01"*
  - CEP: **`01310-100`** *(Avenida Paulista)* ou **`22041-001`** *(Copacabana)*.
* **Falo para o professor:** *"Veja, professor, assim que terminei de digitar o CEP, o backend consultou a API e já preencheu a Avenida Paulista, o Bairro Bela Vista, São Paulo, SP e o Estado por extenso sozinho!"*
* Digito o número: `1500`.
* Clico em **"Cadastrar Pessoa & Endereço"**.
* Mostro a mensagem verde de sucesso e o registro novo aparecendo na tabela abaixo.

### 4º Passo: Mostrar que a API REST funciona de verdade
* Rodo no terminal o script de teste que criei:
  ```bash
  npm run test:api
  ```
* Mostro as respostas com status `200 OK` no GET e `201 Created` no POST com os JSONs formatados.

### 5º Passo: O Teste de Ouro (A Prova da Persistência do Volume)
* Falo para o professor: *"Professor, agora vou te provar que o volume Docker funciona de verdade e os dados não estão na memória volátil do container."*
* No terminal, eu deleto o container do banco:
  ```bash
  docker compose rm -f -s db
  docker compose up -d db
  ```
* Volto na tela do navegador, clico no botão **"Recarregar Lista de Pessoas"** e mostro:
* *"Veja que a Mariana Silva que acabei de cadastrar continua aqui, porque os dados ficaram salvos no volume persistente `mysql_data` no meu disco!"*

---

## 📋 5. Meu Checklist de Requisitos Entregues

Para ter certeza de que cumpri 100% do que o professor pediu:

| O que o professor pediu | O que eu fiz no projeto | Onde está o código |
| :--- | :--- | :--- |
| **Pelo menos 3 containers** | 1. Frontend (React/Nginx)<br>2. Backend (Node/Express)<br>3. DB (MySQL 8) | [docker-compose.yml](file:///c:/Users/renato/Downloads/cep-solidario-intelligence-saas/docker-compose.yml) |
| **Usar Docker Compose** | Orquestração completa com variáveis de ambiente e dependências | [docker-compose.yml](file:///c:/Users/renato/Downloads/cep-solidario-intelligence-saas/docker-compose.yml) |
| **Containers separados** | `Dockerfile.frontend` e `Dockerfile.backend` separados | `Dockerfile.frontend`, `Dockerfile.backend` |
| **Mesma rede Docker** | Rede bridge dedicada chamada `cep_network` | `docker-compose.yml` (`cep_network`) |
| **POST para cadastro** | Rota `POST /api/pessoas` com validação e enriquecimento de CEP | [server.ts](file:///c:/Users/renato/Downloads/cep-solidario-intelligence-saas/server.ts) |
| **GET para listagem** | Rota `GET /api/pessoas` retornando array JSON ordenado | [server.ts](file:///c:/Users/renato/Downloads/cep-solidario-intelligence-saas/server.ts) |
| **Volume Docker** | Volume nomeado `mysql_data` montado em `/var/lib/mysql` | `docker-compose.yml` (`mysql_data`) |
| **Campos do Usuário** | Nome, CPF, CEP, Número, Complemento | [src/components/PessoasView.tsx](file:///c:/Users/renato/Downloads/cep-solidario-intelligence-saas/src/components/PessoasView.tsx) |
| **Campos da API de CEP** | Logradouro, Bairro, Localidade, UF, Estado, Rua | [server.ts](file:///c:/Users/renato/Downloads/cep-solidario-intelligence-saas/server.ts) |
| **Código completo + README** | Repositório estruturado, documentado e testado | `README.md`, `package.json` |

---

> 💡 **Minha Nota Mental:** Manter a calma, falar com naturalidade, ter orgulho do projeto que construí e usar os termos técnicos certos: *rede bridge, volume nomeado, service discovery por DNS interno e integridade relacional*. O projeto está completo e pronto para nota máxima!
