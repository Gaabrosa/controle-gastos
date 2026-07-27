const path = require("node:path");
const express = require("express");
const helmet = require("helmet");
const gastosRoutes = require("./routes/gastos.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

if (process.env.VERCEL) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/auth", authRoutes);
app.use("/gastos", gastosRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.use((erro, req, res, next) => {
  console.error(erro);

  if (erro.type === "entity.too.large") {
    return res.status(413).json({ erro: "Corpo da requisição muito grande" });
  }

  res.status(500).json({ erro: "Erro interno do servidor" });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

module.exports = app;
