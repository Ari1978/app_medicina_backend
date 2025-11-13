import express from "express";
import { UsuarioAutorizadoController } from "../controllers/usuarioAutorizado.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ✅ RUTA PÚBLICA: Validar CUIT para registro
router.post("/validar-cuit", UsuarioAutorizadoController.validarCuitRegistro);

// 🔐 RUTAS PROTEGIDAS (staff/admin)
router.post("/crear", authRequired, UsuarioAutorizadoController.crear);
router.get("/listar", authRequired, UsuarioAutorizadoController.listar);
router.get("/validar/:cuit", authRequired, UsuarioAutorizadoController.validarCuit);
router.post("/importar", authRequired, UsuarioAutorizadoController.importar);

export default router;
