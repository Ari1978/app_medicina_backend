import { Router } from "express";
import { SaludMentalController } from "../controllers/saludMental.controller.js";
import {
  authUserRequired,
  authStaffRequired,
  authAdminRequired,
  requirePermisos
} from "../middlewares/auth.middleware.js";
import { COOKIE_USER, COOKIE_STAFF, COOKIE_ADMIN } from "../utils/jwt.js";

const router = Router();

// ✅ Permite acceso a cualquier usuario autenticado (User / Staff / Admin)
const allowAnyAuth = (req, res, next) => {
  if (req.cookies[COOKIE_USER]) return authUserRequired(req, res, next);
  if (req.cookies[COOKIE_STAFF]) return authStaffRequired(req, res, next);
  if (req.cookies[COOKIE_ADMIN]) return authAdminRequired(req, res, next);
  return res.status(401).json({ message: "No autenticado" });
};

// ✅ Acceso solo Staff con permiso "saludMental" o Admin
const allowSaludMentalAccess = (req, res, next) => {
  if (req.cookies[COOKIE_STAFF]) {
    return authStaffRequired(req, res, () =>
      requirePermisos("saludMental")(req, res, next)
    );
  }

  if (req.cookies[COOKIE_ADMIN]) {
    return authAdminRequired(req, res, next);
  }

  return res.status(403).json({ message: "No autorizado" });
};

// ================== USER ==================
router.post("/solicitudes", allowAnyAuth, SaludMentalController.crear);
router.get("/solicitudes/mis", authUserRequired, SaludMentalController.listarMisSolicitudes);

// ================== STAFF / ADMIN ==================
router.get("/solicitudes", allowSaludMentalAccess, SaludMentalController.listarTodas);
router.put("/solicitudes/:id/presupuesto", allowSaludMentalAccess, SaludMentalController.setPresupuesto);
router.put("/solicitudes/:id/estado", allowSaludMentalAccess, SaludMentalController.cambiarEstado);
router.post("/solicitudes/:id/notificar-turnos", allowSaludMentalAccess, SaludMentalController.notificarTurnos);

export default router;
