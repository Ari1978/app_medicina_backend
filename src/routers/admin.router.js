import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authAdminRequired, requireSuperAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// ==================== AUTH ADMIN ====================

// Login Admin / SuperAdmin
router.post("/login", AdminController.login);

// Obtener admin autenticado
router.get("/me", authAdminRequired, AdminController.me);

// Logout
router.post("/logout", authAdminRequired, AdminController.logout);

// ==================== GESTIÓN ADMIN/STaff ====================

// Solo SuperAdmin crea otros Admin
router.post("/crear-admin", authAdminRequired, requireSuperAdmin, AdminController.crearAdmin);

// Admin y SuperAdmin crean Staff
router.post("/crear-staff", authAdminRequired, AdminController.crearStaff);

// Listar todos los admins y staff
router.get("/listar-usuarios", authAdminRequired, AdminController.listar);

// Buscar usuario por CUIT
router.get("/usuario/:cuit", authAdminRequired, AdminController.buscarUsuario);

export default router;
