// src/routers/turno.router.js
import { Router } from "express";
import { TurnoController } from "../controllers/turno.controller.js";
import {
  authUserRequired,
  authStaffRequired,
  authAdminRequired,
  requirePermisos,
} from "../middlewares/auth.middleware.js";

const router = Router();

/* ============================================================
   🔵 SECCIÓN USER (EMPRESA)
   Empresa solo maneja SUS turnos (empresaId = userId)
============================================================ */

// Listar turnos del propio usuario/empresa
router.get(
  "/mis/confirmados",
  authUserRequired,
  TurnoController.listarMisConfirmados
);

router.get(
  "/mis/provisionales",
  authUserRequired,
  TurnoController.listarProvisionales
);

// Crear provisional (user/empresa)
router.post("/", authUserRequired, TurnoController.crearProvisional);

// Confirmar
router.put(
  "/confirmar/:id",
  authUserRequired,
  TurnoController.confirmar
);

// Actualizar provisional del usuario
router.put(
  "/:id",
  authUserRequired,
  TurnoController.actualizar
);

// Eliminar provisional del usuario
router.delete(
  "/:id",
  authUserRequired,
  TurnoController.eliminar
);

/* ============================================================
   🔵 SECCIÓN STAFF
   Staff puede ver TODAS las empresas, con permisos turnos/examenes
============================================================ */

// 👉 AgendaStaff: Lista TODOS los turnos confirmados del día
// ⚠️ IMPORTANTE: esta ruta debe ir antes de rutas /:id
router.get(
  "/confirmados",
  authStaffRequired,
  requirePermisos("turnos", "examenes"),
  TurnoController.listarTodosConfirmados
);

// Crear provisional en nombre de empresa/usuario
router.post(
  "/empresa",
  authStaffRequired,
  requirePermisos("turnos", "examenes"),
  TurnoController.crearProvisional
);

// Exportar Excel del día
router.get(
  "/exportar",
  authStaffRequired,
  requirePermisos("turnos", "examenes"),
  TurnoController.exportarTurnosExcel
);

/* ============================================================
   🔵 SECCIÓN ADMIN / SUPERADMIN
   Admin ve TODOS los turnos confirmados del sistema
============================================================ */

router.get(
  "/admin/all",
  authAdminRequired,
  TurnoController.listarTodosConfirmados
);

router.get(
  "/admin/exportar",
  authAdminRequired,
  TurnoController.exportarTurnosExcel
);

export default router;
