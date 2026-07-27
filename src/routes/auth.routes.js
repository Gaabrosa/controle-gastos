const { Router } = require("express");
const authController = require("../controllers/auth.controller");

const router = Router();

router.post("/registrar", authController.registrar);
router.post("/login", authController.login);

module.exports = router;
