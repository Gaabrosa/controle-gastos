const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function registrar(req, res, next) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "nome, email e senha são obrigatórios" });
    }

    if (!REGEX_EMAIL.test(email)) {
      return res.status(400).json({ erro: "email inválido" });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: "senha deve ter pelo menos 6 caracteres" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email`,
      [nome, email.toLowerCase(), senhaHash]
    );

    const usuario = resultado.rows[0];
    const token = gerarToken(usuario.id);

    res.status(201).json({ token, usuario });
  } catch (erro) {
    if (erro.code === "23505") {
      return res.status(409).json({ erro: "Já existe uma conta com esse email" });
    }
    next(erro);
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "email e senha são obrigatórios" });
    }

    const resultado = await db.query(
      "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1",
      [email.toLowerCase()]
    );

    const usuario = resultado.rows[0];
    const senhaValida = usuario && (await bcrypt.compare(senha, usuario.senha_hash));

    if (!senhaValida) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const token = gerarToken(usuario.id);

    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (erro) {
    next(erro);
  }
}

function gerarToken(usuarioId) {
  return jwt.sign({ usuarioId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

module.exports = { registrar, login };
