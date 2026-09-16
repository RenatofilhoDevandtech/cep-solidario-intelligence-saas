# 🧪 Guia Prático de Testes & Validação de Arquitetura

> **Material Didático de Apoio ao Aprendizado:**
> Este documento reúne todos os testes criados no projeto, explicando **por que foram feitos**, **como funcionam** e **como executá-los** no seu dia a dia como desenvolvedor de software.

---

## 🎯 Por que testar uma aplicação com Docker & Múltiplos Serviços?

Quando trabalhamos com múltiplos containers (**Frontend Nginx**, **Backend Node.js** e **Banco MySQL**), testar não é apenas verificar se o código compila. Precisamos garantir:

1. **Integridade de Tipos:** Se o TypeScript detecta inconsistências antes de subir os containers.
2. **Comunicação entre Serviços:** Se a API consegue se conectar ao MySQL na porta `3306` pela rede `cep_network`.
3. **Contratos da API REST:** Se o `POST` retorna status `201 Created` e o `GET` retorna `200 OK` com os campos corretos.
4. **Persistência Real do Volume:** Se os dados continuam salvos no disco mesmo se o container for destruído.
5. **Segurança e LGPD:** Se os dados sensíveis (como CPF) são tratados com respeito à privacidade.

---

## 🏗️ A Pirâmide de Testes deste Projeto

```
               ▲
              / \
             /   \      5. Teste Funcional no Navegador (UI + LGPD + Auto-CEP)
            /─────\
           /       \    4. Teste de Resiliência do Volume Docker (Disaster Recovery)
          /─────────\
         /           \  3. Teste de API REST HTTP (POST / GET / Endpoints)
        /─────────────\
       /               \ 2. Teste de Integração com Banco (scripts/test-db.ts)
      /─────────────────\
     /                   \ 1. Teste Estático de Tipos (TypeScript: npm run lint)
    ───────────────────────
```

---

## 🔬 Teste 1: Validação Estática de Tipos (TypeScript)

### O que ele faz?
O comando analisa todo o código TypeScript (`.ts` e `.tsx`) sem compilar arquivos JavaScript no disco. Ele valida se as interfaces (`PessoaRecord`, `NewPessoaPayload`, etc.) batem exatamente com o que os componentes e funções esperam.

### Como executar:
```bash
npm run lint
```

### O que esperar:
```bash
> tsc --noEmit
# Saída vazia com código de saída 0 = ZERO erros de tipagem!
```

> **💡 O que você aprende aqui:**
> Erros de tipagem encontrados antes do runtime poupam horas de depuração dentro de containers Docker.

---

## 🔬 Teste 2: Teste de Integração do Módulo de Banco (`scripts/test-db.ts`)

Criamos um script dedicado em [`../scripts/test-db.ts`](../scripts/test-db.ts) que testa a camada de banco de dados diretamente, sem depender de abrir o navegador.

### O que o teste executa:
1. **Audita a saúde do banco (`getDbHealth()`):** Verifica se está conectado ao MySQL ou em modo fallback.
2. **Consulta a lista inicial (`getPessoasDb()`):** Garante que a leitura no banco funciona.
3. **Grava uma nova pessoa (`createPessoaDb()`):** Executa o comando de inserção.
4. **Faz a validação (`Assertion`):** Confere se o registro recém-criado foi realmente salvo e pode ser encontrado.

### Como executar no terminal:
```bash
npm run test:db
# ou diretamente:
npx tsx scripts/test-db.ts
```

### Exemplo de saída esperada:
```text
====================================================
🧪 TESTE 1: AUDITORIA DE INFRAESTRUTURA DOCKER & BANCO
====================================================

🔍 Status da Conexão: 🟢 CONECTADO AO MYSQL
🌐 Host do Banco: db:3306
📁 Base de Dados: cepsolidario_db
💾 Volume Docker Mapeado: mysql_data
🔗 Rede Docker: cep_network

====================================================
🧪 TESTE 2: CONSULTA INICIAL DE REGISTROS (READ)
====================================================
📋 Total de pessoas encontradas antes do teste: 3

====================================================
🧪 TESTE 3: INSERÇÃO DE NOVA PESSOA E ENDEREÇO (CREATE)
====================================================
⏳ Enviando registro para gravação no banco...
✅ Registro gravado com sucesso!
ID Gerado: 4
Nome: Carlos Drummond de Andrade (Teste Automatizado)

====================================================
🧪 TESTE 4: CONFIRMAÇÃO DE PERSISTÊNCIA (ASSERTION)
====================================================
📋 Total de pessoas após inserção: 4
🎉 SUCESSO ABSOLUTO: O registro foi localizado na lista e está devidamente persistido!
```

> **💡 O que você aprende aqui:**
> Você aprende a testar regras de persistência de forma isolada, rápida e sem necessidade de interface gráfica.

---

## 🔬 Teste 3: Teste de API REST via HTTP (`scripts/test-api.ts`)

Criamos o script [`../scripts/test-api.ts`](../scripts/test-api.ts) para simular requisições HTTP reais de clientes (como o frontend, mobile ou parceiros B2B).

### O que o teste valida:
* **`GET /api/system/docker-status`:** Retorna o status dos 3 containers na rede Docker.
* **`GET /api/pessoas`:** Retorna `HTTP 200 OK` com a lista em JSON.
* **`POST /api/pessoas`:** Envia um cadastro propositalmente **sem logradouro e sem bairro** para testar se o backend busca os dados automaticamente na API de CEP pública e retorna `HTTP 201 Created`.

### Como executar:
1. Com o backend rodando (`npm run dev` ou `docker compose up`), abra outro terminal e execute:
```bash
npm run test:api
# ou diretamente:
npx tsx scripts/test-api.ts
```

### Como testar também via cURL / PowerShell:

**Listar Pessoas (GET):**
```bash
curl -X GET http://localhost:5000/api/pessoas
```

**Cadastrar Pessoa (POST com auto-completar de CEP):**
```bash
curl -X POST http://localhost:5000/api/pessoas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Machado de Assis",
    "cpf": "111.222.333-44",
    "cep": "01310-100",
    "numero": "200",
    "complemento": "Apto 101"
  }'
```

> **💡 O que você aprende aqui:**
> Como funciona o contrato de uma API REST: métodos HTTP adequados (`POST` para criação, `GET` para leitura) e códigos de status (`201` para recurso criado, `200` para sucesso).

---

## 🔬 Teste 4: Teste de Resiliência do Volume Docker (Disaster Recovery)

Este é o teste mais importante para a **banca avaliadora**, pois comprova que você entendeu o conceito de volumes no Docker.

### O Conceito Teórico:
* Containers são **efêmeros** por padrão (se forem removidos, seus dados internos são destruídos).
* O **Volume Docker (`mysql_data`)** é persistido no sistema de arquivos do computador host, fora do ciclo de vida do container.

### Roteiro Prático de Teste (Faça ao vivo!):

1. **Suba o ambiente com Docker Compose:**
   ```bash
   docker compose up -d
   ```
2. **Acesse [http://localhost:3000](http://localhost:3000)** na aba *"Pessoas & Endereços"* e cadastre uma pessoa com seu nome.
3. **Destrua o container do MySQL à força:**
   ```bash
   # O comando abaixo para e REMOVE o container do banco:
   docker compose rm -f -s db
   ```
4. **Verifique que o container realmente sumiu:**
   ```bash
   docker ps
   # Note que o container cep_solidario_mysql não aparece mais na lista.
   ```
5. **Recrie o container do MySQL:**
   ```bash
   docker compose up -d db
   ```
6. **Volte ao navegador e clique em "Recarregar Lista":**
   * **Resultado:** O registro cadastrado continua lá perfeitamente intacto!
   * **Por que isso acontece?** Porque a pasta `/var/lib/mysql` foi montada no volume externo `mysql_data`.

> **💡 O que você aprende aqui:**
> A diferença fundamental entre o ciclo de vida efêmero de um container e a persistência de estado em volumes gerenciados pelo Docker.

---

## 🔬 Teste 5: Teste Funcional do Frontend (Interface + LGPD)

### Roteiro de Verificação da Interface:
1. Abra **[http://localhost:3000](http://localhost:3000)**.
2. Navegue até a aba **"Pessoas & Endereços"**.
3. **Teste do Auto-Lookup de CEP:**
   * No campo CEP, digite `22041-001`.
   * Observe que os campos **Logradouro**, **Rua**, **Bairro**, **Localidade**, **UF** e **Estado (Rio de Janeiro)** são preenchidos na hora sem você precisar digitar uma única letra neles.
4. **Teste de Validação de Erros:**
   * Tente submeter o formulário sem preencher o Nome ou com CPF incompleto.
   * Observe as mensagens amigáveis de prevenção de erro (Heurística de Nielsen #5).
5. **Teste do Alternador LGPD:**
   * Na tabela de pessoas cadastradas, observe que o CPF aparece mascarado por padrão: `***.456.789-**`.
   * Clique no botão **"Modo Banca: CPF Completo"** e veja os dígitos completos sendo revelados para avaliação do professor.

---

## 📚 Comandos Úteis para o seu Aprendizado

| Ação | Comando |
| :--- | :--- |
| **Verificar tipagem sem compilar** | `npm run lint` |
| **Rodar teste de banco de dados** | `npm run test:db` |
| **Rodar teste de chamadas HTTP** | `npm run test:api` |
| **Construir bundle de produção** | `npm run build` |
| **Subir todos os containers** | `docker compose up --build` |
| **Ver logs dos containers ao vivo** | `docker compose logs -f` |
| **Inspecionar volume no Docker** | `docker volume inspect cep-solidario-intelligence-saas_mysql_data` |
| **Derrubar containers mantendo volume** | `docker compose down` |
| **Derrubar containers apagando volume** | `docker compose down -v` *(cuidado: apaga os dados)* |

---

Guarde este arquivo como referência para seus próximos projetos com Docker, microsserviços e persistência de dados relacionais!
