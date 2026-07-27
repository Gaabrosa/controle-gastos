const db = require("../db");

async function listar(req, res, next) {
  try {
    const resultado = await db.query(
      "SELECT * FROM gastos WHERE usuario_id = $1 ORDER BY data DESC, id DESC",
      [req.usuarioId]
    );
    res.json(resultado.rows);
  } catch (erro) {
    next(erro);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const resultado = await db.query("SELECT * FROM gastos WHERE id = $1 AND usuario_id = $2", [
      req.params.id,
      req.usuarioId,
    ]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Gasto não encontrado" });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    next(erro);
  }
}

async function criar(req, res, next) {
  try {
    const { descricao, valor, categoria, data } = req.body;

    if (!descricao || valor === undefined) {
      return res.status(400).json({ erro: "descricao e valor são obrigatórios" });
    }

    const resultado = await db.query(
      `INSERT INTO gastos (usuario_id, descricao, valor, categoria, data)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
       RETURNING *`,
      [req.usuarioId, descricao, valor, categoria ?? null, data ?? null]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    next(erro);
  }
}

async function atualizar(req, res, next) {
  try {
    const { descricao, valor, categoria, data } = req.body;

    const resultado = await db.query(
      `UPDATE gastos
       SET descricao = COALESCE($1, descricao),
           valor = COALESCE($2, valor),
           categoria = COALESCE($3, categoria),
           data = COALESCE($4, data)
       WHERE id = $5 AND usuario_id = $6
       RETURNING *`,
      [descricao ?? null, valor ?? null, categoria ?? null, data ?? null, req.params.id, req.usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Gasto não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    next(erro);
  }
}

async function remover(req, res, next) {
  try {
    const resultado = await db.query(
      "DELETE FROM gastos WHERE id = $1 AND usuario_id = $2 RETURNING id",
      [req.params.id, req.usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Gasto não encontrado" });
    }

    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
