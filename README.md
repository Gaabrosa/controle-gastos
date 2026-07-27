# Controle de Gastos

Aplicação para controle de gastos pessoais, com API em Node.js/Express/PostgreSQL e um frontend simples em HTML/CSS/JS. Cada usuário tem sua própria conta e só enxerga os próprios gastos.

## Tecnologias

- [Express](https://expressjs.com/) — servidor HTTP e roteamento
- [pg](https://node-postgres.com/) — driver PostgreSQL
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — hash de senha
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — autenticação via token (JWT)

## Pré-requisitos

- Node.js 22+ (usa `--env-file`, nativo do Node, para carregar variáveis de ambiente)
- PostgreSQL rodando localmente (ou acessível pela rede)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o `.env.example` para `.env` e preencha com os dados do seu banco:

   ```bash
   cp .env.example .env
   ```

3. Crie o banco de dados (se ainda não existir) e aplique o schema em `src/db/schema.sql`:

   ```bash
   psql -U postgres -d controle_gastos -f src/db/schema.sql
   ```

## Executando

```bash
npm start   # produção
npm run dev # desenvolvimento, reinicia automaticamente ao salvar arquivos
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT` no `.env`). Abra essa URL no navegador — se não estiver logado, você é redirecionado para a tela de login/cadastro.

## Rotas

### Autenticação (`/auth`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/registrar` | Cria uma conta (`nome`, `email`, `senha` — mínimo 6 caracteres). Retorna `token` e `usuario` |
| POST | `/auth/login` | Autentica (`email`, `senha`). Retorna `token` e `usuario` |

### Gastos (`/gastos`)

Todas exigem o cabeçalho `Authorization: Bearer <token>` obtido no login/registro, e cada usuário só acessa os próprios gastos.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/gastos` | Lista os gastos do usuário autenticado |
| GET | `/gastos/:id` | Busca um gasto pelo id |
| POST | `/gastos` | Cria um gasto (`descricao` e `valor` obrigatórios; `categoria` e `data` opcionais) |
| PUT | `/gastos/:id` | Atualiza um ou mais campos de um gasto |
| DELETE | `/gastos/:id` | Remove um gasto |

### Exemplo — login e criação de um gasto

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"voce@exemplo.com","senha":"123456"}' | jq -r .token)

curl -X POST http://localhost:3000/gastos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"descricao":"Mercado","valor":150.50,"categoria":"Alimentação"}'
```

## Estrutura do projeto

```
src/
  db.js                              pool de conexão com o PostgreSQL
  db/schema.sql                       schema das tabelas `usuarios` e `gastos`
  middlewares/auth.middleware.js      valida o token JWT e injeta req.usuarioId
  routes/auth.routes.js               rotas de registro/login
  routes/gastos.routes.js             rotas de gastos (protegidas pelo middleware de auth)
  controllers/auth.controller.js      lógica de registro/login (hash de senha, geração de token)
  controllers/gastos.controller.js    lógica de cada rota de gastos (sempre filtrada por usuario_id)
  server.js                           ponto de entrada: monta o Express, serve o frontend e sobe o servidor
public/
  login.html / login.js               tela de login e cadastro
  index.html                          página principal (exige login)
  style.css                           estilos
  app.js                              consome a API /gastos via fetch, envia o token, e trata logout/expiração
```
