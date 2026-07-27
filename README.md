# Controle de Gastos

API para controle de gastos pessoais, construída com Node.js, Express e PostgreSQL.

## Tecnologias

- [Express](https://expressjs.com/) — servidor HTTP e roteamento
- [pg](https://node-postgres.com/) — driver PostgreSQL

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

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT` no `.env`).

## Rotas

Todas as rotas abaixo são relativas a `/gastos` e trocam/retornam JSON.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/gastos` | Lista todos os gastos |
| GET | `/gastos/:id` | Busca um gasto pelo id |
| POST | `/gastos` | Cria um gasto (`descricao` e `valor` obrigatórios; `categoria` e `data` opcionais) |
| PUT | `/gastos/:id` | Atualiza um ou mais campos de um gasto |
| DELETE | `/gastos/:id` | Remove um gasto |

### Exemplo — criar um gasto

```bash
curl -X POST http://localhost:3000/gastos \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Mercado","valor":150.50,"categoria":"Alimentação"}'
```

## Estrutura do projeto

```
src/
  db.js                       pool de conexão com o PostgreSQL
  db/schema.sql                schema da tabela `gastos`
  routes/gastos.routes.js      definição das rotas
  controllers/gastos.controller.js  lógica de cada rota (queries ao banco)
  server.js                    ponto de entrada: monta o Express e sobe o servidor
```
