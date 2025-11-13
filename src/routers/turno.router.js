import { Router } from "express";
import { TurnoController } from "../controllers/turno.controller.js";
import {
  authUserRequired,
  authStaffRequired,
  authAdminRequired,
  requirePermisos,
} from "../middlewares/auth.middleware.js";

const router = Router();

// ==================== USER (EMPRESA) ====================
// Empresa solo puede manejar sus propios turnos
router.get("/mis/confirmados", authUserRequired, TurnoController.listarMisConfirmados);
router.get("/mis/provisionales", authUserRequired, TurnoController.listarProvisionales);
router.post("/", authUserRequired, TurnoController.crearProvisional);
router.put("/confirmar/:id", authUserRequired, TurnoController.confirmar);
router.put("/:id", authUserRequired, TurnoController.actualizar);
router.delete("/:id", authUserRequired, TurnoController.eliminar);

// ==================== STAFF ====================
// Staff puede ver y crear para distintas empresas, con permiso "turnos" o "examenes"
router.get(
  "/",
  authStaffRequired,
  requirePermisos("turnos", "examenes"), // ✅ cualquiera de los dos
  TurnoController.listarTodosConfirmados
);

router.post(
  "/empresa",
  authStaffRequired,
  requirePermisos("turnos", "examenes"), // ✅ cualquiera de los dos
  TurnoController.crearProvisional
);

// ✅ Exportar turnos del día actual a Excel (Staff con permiso “turnos” o “examenes”)
router.get(
  "/exportar",
  authStaffRequired,
  requirePermisos("turnos", "examenes"), // ✅ cualquiera de los dos
  TurnoController.exportarTurnosExcel
);

// ==================== ADMIN ====================
// Admin ve todos los confirmados del sistema sin restricciones
router.get("/admin/all", authAdminRequired, TurnoController.listarTodosConfirmados);

// ✅ Exportar turnos del día actual a Excel (Admin)
router.get("/admin/exportar", authAdminRequired, TurnoController.exportarTurnosExcel);

export default router;
