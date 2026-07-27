const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");

const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Na Vercel, req.ip pode não refletir o cliente real dependendo do número de
  // saltos de proxy; x-real-ip é definido pela própria Vercel com o IP real.
  keyGenerator: (req) => req.headers["x-real-ip"]?.toString() ?? req.ip,
  message: { erro: "Muitas tentativas. Tente novamente mais tarde." },
});

const router = Router();

router.use(limiteAuth);

router.post("/registrar", authController.registrar);
router.post("/login", authController.login);

module.exports = router;
