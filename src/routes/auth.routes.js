const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const authController = require("../controllers/auth.controller");

const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Na Vercel, req.ip pode não refletir o cliente real dependendo do número de
  // saltos de proxy; x-real-ip é definido pela própria Vercel com o IP real.
  // Fora da Vercel esse header vem do próprio cliente e pode ser forjado para
  // burlar o rate limit, então só confiamos nele quando process.env.VERCEL
  // está definido (mesma condição usada para "trust proxy" em server.js).
  // ipKeyGenerator normaliza o valor (necessário para não abrir brecha com IPv6).
  keyGenerator: (req) => {
    const ip = process.env.VERCEL ? req.headers["x-real-ip"]?.toString() ?? req.ip : req.ip;
    return ipKeyGenerator(ip);
  },
  message: { erro: "Muitas tentativas. Tente novamente mais tarde." },
});

const router = Router();

router.use(limiteAuth);

router.post("/registrar", authController.registrar);
router.post("/login", authController.login);

module.exports = router;
