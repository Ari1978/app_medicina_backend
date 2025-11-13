import { Router } from "express";
import { StaffController } from "../controllers/staffUser.controller.js";
import {
  authStaffRequired,
  authAdminRequired,
  requirePermisos
} from "../middlewares/auth.middleware.js";
import { COOKIE_STAFF, COOKIE_ADMIN } from "../utils/jwt.js";

const router = Router();

// ==================== LOGIN STAFF ====================
router.post("/login", StaffController.login);

// ==================== PERFIL STAFF ====================
router.get("/me", authStaffRequired, StaffController.me);

// ==================== LOGOUT ====================
router.post("/logout", authStaffRequired, StaffController.logout);

// ==================== MÓDULOS CON PERMISOS ====================

// Módulo Turnos (solo staff con permiso "turnos")
router.get(
  "/modulo/turnos",
  authStaffRequired,
  requirePermisos("turnos"),
  (req, res) => {
    res.json({ message: "Acceso módulo Turnos (staff)" });
  }
);

// Módulo RRHH (solo staff con permiso "rrhh")
router.get(
  "/modulo/rrhh",
  authStaffRequired,
  requirePermisos("rrhh"),
  (req, res) => {
    res.json({ message: "Acceso módulo RRHH (staff)" });
  }
);

export default router;
