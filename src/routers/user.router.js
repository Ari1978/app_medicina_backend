// src/routers/user.router.js
import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authUserRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// =========================================================
// 🔐 AUTH USER (EMPRESA)
// =========================================================

// 👉 Validar CUIT antes de permitir registro
router.post("/check-cuit", UserController.checkCuit);

// 👉 Registro de nuevo usuario (empresa)
router.post("/register", UserController.register);

// 👉 Login empresa (crea cookie asmel_user_token)
router.post("/login", UserController.login);

// 👉 Datos del usuario autenticado (desde cookie + JWT)
router.get("/me", authUserRequired, UserController.me);

// 👉 Logout (no requiere authUserRequired)
router.post("/logout", UserController.logout);

// 👉 Ejemplo ruta protegida
router.get("/turnos", authUserRequired, (req, res) => {
  res.json({
    message: "Turnos del usuario autenticado",
    userId: req.user._id,
  });
});

export default router;
