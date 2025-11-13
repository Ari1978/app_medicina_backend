import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authUserRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// ==================== AUTH USER (EMPRESA) ====================

router.post("/check-cuit", UserController.checkCuit);

// Registro (no requiere estar logueado)
router.post("/register", UserController.register);

// Login
router.post("/login", UserController.login);

// Obtener usuario autenticado
router.get("/me", authUserRequired, UserController.me);

// Logout
router.post("/logout", authUserRequired, UserController.logout);

// Ejemplo de ruta protegida
router.get("/turnos", authUserRequired, (req, res) => {
  res.json({ message: "Turnos del usuario", userId: req.user._id });
});

export default router;
