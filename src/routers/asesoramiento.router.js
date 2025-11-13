import { Router } from "express";
import { AsesoramientoController } from "../controllers/asesoramiento.controller.js";
import { authUserRequired, authStaffRequired, authAdminRequired } from "../middlewares/auth.middleware.js";
import { COOKIE_USER, COOKIE_STAFF, COOKIE_ADMIN } from "../utils/jwt.js";

const router = Router();

// ✅ Middleware: cualquiera autenticado (User, Staff o Admin)
const allowAnyAuth = (req, res, next) => {
  if (req.cookies[COOKIE_USER]) return authUserRequired(req, res, next);
  if (req.cookies[COOKIE_STAFF]) return authStaffRequired(req, res, next);
  if (req.cookies[COOKIE_ADMIN]) return authAdminRequired(req, res, next);
  return res.status(401).json({ message: "No autenticado" });
};

// ✅ Middleware: solo Staff o Admin
const allowStaffOrAdmin = (req, res, next) => {
  if (req.cookies[COOKIE_STAFF]) return authStaffRequired(req, res, next);
  if (req.cookies[COOKIE_ADMIN]) return authAdminRequired(req, res, next);
  return res.status(403).json({ message: "No autorizado" });
};

router.post("/solicitudes", allowAnyAuth, AsesoramientoController.crear);
router.get("/solicitudes", allowStaffOrAdmin, AsesoramientoController.listar);
router.put("/solicitudes/:id", allowStaffOrAdmin, AsesoramientoController.actualizarEstado);

export default router;
