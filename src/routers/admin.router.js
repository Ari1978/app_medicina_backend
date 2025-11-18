import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import {
  authAdminRequired,
  requireSuperAdmin,
  requirePerfilManager,
} from "../middlewares/auth.middleware.js";

const router = Router();

/* ================================
   🔐 AUTH
================================ */
router.post("/login", AdminController.login);
router.get("/me", authAdminRequired, AdminController.me);
router.post("/logout", authAdminRequired, AdminController.logout);

/* ================================
   👑 ADMIN / STAFF / EMPRESA
================================ */
router.post(
  "/crear-admin",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.crearAdmin
);

router.post(
  "/crear-staff",
  authAdminRequired,
  AdminController.crearStaff
);

router.post(
  "/crear-empresa",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.crearEmpresa
);

router.get(
  "/listar-usuarios",
  authAdminRequired,
  AdminController.listar
);

router.get(
  "/usuario/:cuit",
  authAdminRequired,
  AdminController.buscarUsuario
);

/* ================================
   👑 SUPERADMIN
================================ */
router.get(
  "/resumen-superadmin",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.resumenSuperadmin
);

router.get(
  "/usuarios",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.listarUsuariosSistema
);

router.post(
  "/importar-usuarios",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.importarUsuarios
);

/* ================================
   🧪 PERFILES (CUIT)
================================ */

// Listar perfiles
router.get(
  "/empresa/:cuit/perfiles",
  authAdminRequired,
  requirePerfilManager,
  AdminController.listarPerfiles
);

// Crear perfil
router.post(
  "/empresa/:cuit/perfiles",
  authAdminRequired,
  requirePerfilManager,
  AdminController.crearPerfil
);

// Editar perfil
router.put(
  "/empresa/:cuit/perfiles/:perfilId",
  authAdminRequired,
  requirePerfilManager,
  AdminController.editarPerfil
);

// Eliminar perfil
router.delete(
  "/empresa/:cuit/perfiles/:perfilId",
  authAdminRequired,
  requirePerfilManager,
  AdminController.eliminarPerfil
);

export default router;
