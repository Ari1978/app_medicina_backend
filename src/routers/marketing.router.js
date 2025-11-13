import { Router } from "express";
import { MarketingController } from "../controllers/marketing.controller.js";
import {
  authUserRequired,
  authStaffRequired,
  authAdminRequired,
  requirePermisos
} from "../middlewares/auth.middleware.js";
import { COOKIE_USER, COOKIE_STAFF, COOKIE_ADMIN } from "../utils/jwt.js";

const router = Router();

// ✅ Middleware: permite acceso a cualquier usuario autenticado (User / Staff / Admin)
const allowAnyAuth = (req, res, next) => {
  if (req.cookies[COOKIE_USER]) return authUserRequired(req, res, next);
  if (req.cookies[COOKIE_STAFF]) return authStaffRequired(req, res, next);
  if (req.cookies[COOKIE_ADMIN]) return authAdminRequired(req, res, next);
  return res.status(401).json({ message: "No autenticado" });
};

// ✅ Middleware: acceso solo a Staff con permiso "marketing" o Admin
const allowMarketingAccess = (req, res, next) => {
  if (req.cookies[COOKIE_STAFF]) {
    return authStaffRequired(req, res, () =>
      requirePermisos("marketing")(req, res, next)
    );
  }

  if (req.cookies[COOKIE_ADMIN]) {
    return authAdminRequired(req, res, next);
  }

  return res.status(403).json({ message: "No autorizado" });
};

router.post("/solicitudes", allowAnyAuth, MarketingController.crear);
router.get("/solicitudes", allowMarketingAccess, MarketingController.listar);
router.get("/solicitudes/:id", allowMarketingAccess, MarketingController.detalle);
router.put("/solicitudes/:id/presupuesto", allowMarketingAccess, MarketingController.presupuesto);
router.put("/solicitudes/:id/estado", allowMarketingAccess, MarketingController.cambiarEstado);
router.post("/solicitudes/:id/comentarios", allowMarketingAccess, MarketingController.comentar);

export default router;
