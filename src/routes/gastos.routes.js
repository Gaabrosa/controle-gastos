const { Router } = require("express");
const gastosController = require("../controllers/gastos.controller");
const autenticar = require("../middlewares/auth.middleware");

const router = Router();

router.use(autenticar);

router.get("/", gastosController.listar);
router.get("/:id", gastosController.buscarPorId);
router.post("/", gastosController.criar);
router.put("/:id", gastosController.atualizar);
router.delete("/:id", gastosController.remover);

module.exports = router;
