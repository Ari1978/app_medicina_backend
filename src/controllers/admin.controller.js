/// src/controllers/admin.controller.js
import { AdminService } from "../services/admin.service.js";
import {
  clearAllAuthCookies,
  setAuthCookie,
  COOKIE_ADMIN,
  generateTokenForAdmin,
} from "../utils/jwt.js";
import { UserRepository } from "../repositories/user.repository.js";
import { adminResponseDTO } from "../dto/admin.dto.js";
import { staffResponseDTO } from "../dto/staff.dto.js";
import { userResponseDTO } from "../dto/user.dto.js";

export const AdminController = {

  // ---------------- LOGIN ADMIN / SUPERADMIN ----------------
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password)
        return res.status(400).json({ message: "Usuario y contraseña requeridos" });

      const admin = await AdminService.login(username.trim(), password);

      clearAllAuthCookies(res);

      const token = generateTokenForAdmin(admin);
      setAuthCookie(res, COOKIE_ADMIN, token);

      return res.json({
        message: "Login exitoso",
        user: adminResponseDTO(admin),
        token,
      });
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
  },

  // ---------------- CREAR ADMIN (solo SuperAdmin) ----------------
  async crearAdmin(req, res) {
    try {
      if (!req.user?.superadmin)
        return res.status(403).json({ message: "Solo SuperAdmin" });

      const { username, password, nombre, apellido, superadmin } = req.body;

      if (!username || !password || !nombre || !apellido)
        return res.status(400).json({ message: "Faltan campos" });

      const nuevo = await AdminService.crearAdmin(
        { username, password, nombre, apellido, superadmin },
        req.user
      );

      return res.status(201).json({
        message: "Admin creado",
        admin: adminResponseDTO(nuevo),
      });
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }
  },

  // ---------------- CREAR STAFF ----------------
  async crearStaff(req, res) {
    try {
      if (!req.user || !["admin", "superadmin"].includes(req.user.role))
        return res.status(403).json({ message: "Solo Admin/SuperAdmin" });

      const { username, password, nombre, apellido, permisos } = req.body;

      if (!username || !password || !nombre || !apellido)
        return res.status(400).json({ message: "Faltan campos" });

      const nuevo = await AdminService.crearStaff(
        { username, password, nombre, apellido, permisos },
        req.user
      );

      return res.status(201).json({
        message: "Staff creado",
        staff: staffResponseDTO(nuevo),
      });
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }
  },

  // ---------------- CREAR EMPRESA ----------------
  async crearEmpresa(req, res) {
    try {
      console.log("BODY RECIBIDO EN CREAR-EMPRESA:", req.body);
      if (!req.user?.superadmin)
        return res.status(403).json({ message: "Solo SuperAdmin" });

      const { empresa, cuit, contactoNombre, contactoEmail, password } = req.body;

      if (
  !empresa?.trim() ||
  !cuit?.trim() ||
  !contactoNombre?.trim() ||
  !contactoEmail?.trim() ||
  !password?.trim()
) {
  return res.status(400).json({ message: "Faltan campos obligatorios" });
}


      const nueva = await AdminService.crearEmpresa({
        empresa,
        cuit,
        contactoNombre,
        contactoEmail,
        password,
      });

      return res.status(201).json({
        message: "Empresa creada",
        empresa: nueva,
      });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  // ---------------- LISTAR ADMINS Y STAFF ----------------
  async listar(_req, res) {
    try {
      const lista = await AdminService.listarAdminsYStaff();

      const admins = lista.filter((u) => u.superadmin !== undefined);
      const staff = lista.filter((u) => u.role === "staff");

      return res.json({
        admins: admins.map(adminResponseDTO),
        staff: staff.map(staffResponseDTO),
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  // ---------------- BUSCAR POR CUIT ----------------
  async buscarUsuario(req, res) {
    try {
      const { cuit } = req.params;
      if (!cuit) return res.status(400).json({ message: "CUIT requerido" });

      const user = await UserRepository.findByCuit(cuit);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      return res.json(userResponseDTO(user));
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  async me(req, res) {
    return res.json({ user: adminResponseDTO(req.user) });
  },

  async logout(_req, res) {
    clearAllAuthCookies(res);
    return res.json({ message: "Sesión cerrada" });
  },

    // ============================================================
  // 🔥 SUPERADMIN: RESUMEN DEL SISTEMA
  // ============================================================
  async resumenSuperadmin(_req, res) {
    try {
      const empresas = await UserRepository.countByRole("user");
      const staff = await UserRepository.countByRole("staff");
      const admins = await UserRepository.countByRole("admin");

      return res.json({ empresas, staff, admins });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  // ============================================================
  // 🔥 SUPERADMIN: LISTAR TODOS LOS USUARIOS DEL SISTEMA
  // ============================================================
  async listarUsuariosSistema(_req, res) {
    try {
      const lista = await UserRepository.findAll();
      return res.json(lista);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  // ============================================================
  // 🔥 SUPERADMIN: IMPORTAR USUARIOS DESDE EXCEL
  // ============================================================
  async importarUsuarios(req, res) {
    try {
      const { usuarios } = req.body;

      if (!Array.isArray(usuarios)) {
        return res.status(400).json({ message: "Formato inválido" });
      }

      let creados = 0;
      let existentes = 0;

      for (const u of usuarios) {
        if (!u.cuit || !u.empresa) {
          existentes++;
          continue;
        }

        const existe = await UserRepository.findByCuit(u.cuit);
        if (existe) {
          existentes++;
          continue;
        }

        await UserRepository.crear({
          empresa: u.empresa,
          cuit: u.cuit,
          contacto: { nombre: u.empresa, email: "" },
          password: "temporal123",
        });

        creados++;
      }

      return res.json({ creados, existentes });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },


};
