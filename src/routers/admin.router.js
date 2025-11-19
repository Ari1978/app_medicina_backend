// src/routers/admin.router.js
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { uploadCsv } from "../config/multer.config.js";

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

/* ================================
   VALIDAR CUIT PARA REGISTRO
================================ */
router.post("/validar-empresa", AdminController.validarEmpresa);

/* ================================
   PRECARGA MASIVA DE EMPRESAS
   Espera body: { empresas: [{ empresa, cuit }, ...] }
================================ */
router.post(
  "/importar-empresas",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.importarEmpresas
);

/* ================================
   LISTADOS / STATS
================================ */
router.get("/listar-usuarios", authAdminRequired, AdminController.listar);

router.get("/usuario/:cuit", authAdminRequired, AdminController.buscarUsuario);

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

/* ================================
   IMPORTAR USUARIOS COMPLETOS (legacy)
================================ */
router.post(
  "/importar-usuarios",
  authAdminRequired,
  requireSuperAdmin,
  AdminController.importarUsuarios
);

/* ================================
   IMPORTAR USUARIOS MASIVOS (CSV)
================================ */
router.post(
  "/importar-usuarios",
  authAdminRequired,
  requireSuperAdmin,
  uploadCsv.single("file"),
  AdminController.importarUsuarios
);


/* ================================
   🧪 PERFILES (CUIT)
================================ */
router.get(
  "/empresa/:cuit/perfiles",
  authAdminRequired,
  requirePerfilManager,
  AdminController.listarPerfiles
);

router.post(
  "/empresa/:cuit/perfiles",
  authAdminRequired,
  requirePerfilManager,
  AdminController.crearPerfil
);

router.put(
  "/empresa/:cuit/perfiles/:perfilId",
  authAdminRequired,
  requirePerfilManager,
  AdminController.editarPerfil
);

router.delete(
  "/empresa/:cuit/perfiles/:perfilId",
  authAdminRequired,
  requirePerfilManager,
  AdminController.eliminarPerfil
);

export default router;
