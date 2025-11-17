// src/routers/admin.router.js
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authAdminRequired, requireSuperAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

/* =========================================================
   🔐 AUTH ADMIN / SUPERADMIN
========================================================= */

// Login Admin / SuperAdmin
router.post("/login", AdminController.login);

// Obtener admin autenticado
router.get("/me", authAdminRequired, AdminController.me);

// Logout
router.post("/logout", authAdminRequired, AdminController.logout);


/* =========================================================
   🛠️ GESTIÓN ADMIN / STAFF
========================================================= */

// Solo SuperAdmin crea otros Admin
router.post(
  "/crear-admin",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.crearAdmin
);

// Admin y SuperAdmin crean Staff
router.post(
  "/crear-staff",
  authAdminRequired,
  AdminController.crearStaff
);

// ==================== CREAR EMPRESA (SUPERADMIN) ====================
router.post(
  "/crear-empresa",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.crearEmpresa
);

// Listar admins y staff
router.get(
  "/listar-usuarios",
  authAdminRequired,
  AdminController.listar
);

// Buscar usuario por CUIT
router.get(
  "/usuario/:cuit",
  authAdminRequired,
  AdminController.buscarUsuario
);


/* =========================================================
   👑 SUPERADMIN — RUTAS EXCLUSIVAS
========================================================= */

// Resumen del sistema
router.get(
  "/resumen-superadmin",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.resumenSuperadmin
);

// Listar todos los usuarios del sistema
router.get(
  "/usuarios",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.listarUsuariosSistema
);

// Importar usuarios desde Excel
router.post(
  "/importar-usuarios",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.importarUsuarios
);

export default router;
