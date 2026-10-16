# Testes e validação

Este documento separa verificações locais automatizadas das verificações que exigem serviços externos. Nenhum comando aqui deve ser executado com registros reais de pessoas.

## Verificações automatizadas

### Typecheck

```powershell
npm run lint
```

O script chama `tsc --noEmit`. Apesar do nome, não executa ESLint.

### Build

```powershell
npm run build
```

Compila o frontend com Vite e empacota o servidor TypeScript com esbuild.

### Proteções de segurança

```powershell
npm run test:security
```

Verifica:

- neutralização de campos CSV que começam com caracteres interpretados como fórmula;
- isolamento dos logs/métricas entre duas empresas;
- mascaramento das chaves em listagens e separação por empresa.

O teste usa empresas efêmeras em memória, com endereços de e-mail de domínio reservado `.test`; não acessa rede nem banco.

## Testes com serviços em execução

### API REST

Inicie a aplicação em um terminal:

```powershell
npm run dev
```

Em outro terminal:

```powershell
npm run test:api
```

O teste detecta a API local nas portas 3000 ou 5000 e verifica o endpoint de diagnóstico, o formato agregado de `GET /api/pessoas` e a rejeição de um cadastro sem consentimento. A requisição de cadastro é sintética e deve ser rejeitada antes de persistir qualquer registro.

### MySQL / camada de cadastros

Configure credenciais locais em `.env` e inicie o MySQL, se disponível. Depois execute:

```powershell
npm run test:db
```

O script chama `initDb()`, insere um registro sintético, confirma a leitura e tenta removê-lo em um bloco `finally`. Se o MySQL não estiver disponível em desenvolvimento, a camada usa fallback em memória; nesse caso o teste não comprova persistência durável no banco. Em produção, a aplicação não inicia sem MySQL.

## Compose

```powershell
Copy-Item .env.example .env
# Edite .env e substitua as duas senhas obrigatórias por segredos fortes.
docker compose up --build
```

Valide:

- `http://localhost:3000` abre o frontend servido pelo Nginx;
- `http://localhost:5000/api/health` retorna estado da API;
- `http://localhost:5000/api/system/docker-status` informa o backend e estado da conexão MySQL;
- o serviço `db` fica ligado ao volume nomeado `mysql_data`.

Finalize com `docker compose down`. Não use `docker compose down -v` em ambientes com dados que devam ser preservados.

## Contratos de privacidade a conferir

- `GET /api/pessoas` retorna somente `{ total, cidades: [{ localidade, uf, total }] }`; não deve conter nome, CPF, CEP ou endereço individual.
- `POST /api/pessoas` exige `termo_lgpd: true` e responde apenas com sucesso, ID e data de criação.
- A interface não deve revelar CPF ou endereço individual na listagem.
- Checkout e webhook de pagamento devem responder `501` enquanto a integração não existir; nenhum plano pago ou limite deve ser ativado por essas rotas.
- Avaliações fictícias são exclusivas de desenvolvimento e identificadas como exemplos não verificados; não devem aparecer em produção.

## Limites do que esses testes provam

Os scripts não substituem testes de navegador, avaliação manual de acessibilidade, testes de carga, verificação de segurança de infraestrutura nem revisão jurídica de LGPD. As métricas e limitações de persistência descritas em [segurança e privacidade](seguranca-e-privacidade.md) também se aplicam durante as demonstrações.
