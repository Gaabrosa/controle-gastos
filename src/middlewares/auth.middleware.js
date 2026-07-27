const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;
  const token = cabecalho && cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: "Token não informado" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.usuarioId;
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

module.exports = autenticar;
