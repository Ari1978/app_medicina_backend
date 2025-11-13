import { Router } from "express";
import {
  authUserRequired,
  authStaffRequired,
  authAdminRequired,
} from "../middlewares/auth.middleware.js";
import { CarritoController } from "../controllers/carrito.controller.js";
import { COOKIE_USER, COOKIE_STAFF, COOKIE_ADMIN } from "../utils/jwt.js";

const router = Router();

// ✅ Permitir cualquier tipo de autenticación válida
const allowAnyAuth = (req, res, next) => {
  try {
    if (req.cookies[COOKIE_USER]) return authUserRequired(req, res, next);
    if (req.cookies[COOKIE_STAFF]) return authStaffRequired(req, res, next);
    if (req.cookies[COOKIE_ADMIN]) return authAdminRequired(req, res, next);
    return res.status(401).json({ message: "No autenticado" });
  } catch (err) {
    console.error("❌ [allowAnyAuth] Error:", err);
    return res.status(401).json({ message: "Token inválido" });
  }
};

// -------------------- RUTAS --------------------
router.get("/", allowAnyAuth, CarritoController.getCarrito);
router.post("/", allowAnyAuth, CarritoController.addToCarrito);
router.delete("/clear", allowAnyAuth, CarritoController.clearCarrito);
router.delete("/:id", allowAnyAuth, CarritoController.deleteTurnoCarrito);
router.put("/confirmar", allowAnyAuth, CarritoController.confirmarCarrito);

export default router;
