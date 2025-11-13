// src/controllers/admin.controller.js
import { AdminService } from "../services/admin.service.js";
import { clearAllAuthCookies, setAuthCookie, signToken, COOKIE_ADMIN } from "../utils/jwt.js";
import { UserRepository } from "../repositories/user.repository.js";

export const AdminController = {
  // ---------------- LOGIN ADMIN / SUPERADMIN ----------------
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ message: "Usuario y contraseña son requeridos" });

      const admin = await AdminService.login(username.trim(), password);

      clearAllAuthCookies(res);

      const role = admin.superadmin ? "superadmin" : "admin";

      const token = signToken({
        _id: admin._id,
        nombre: admin.nombre,
        apellido: admin.apellido,
        username: admin.username,
        role,
        superadmin: admin.superadmin,
      });

      setAuthCookie(res, COOKIE_ADMIN, token);

      return res.json({
        message: "✅ Login exitoso",
        user: {
          _id: admin._id,
          nombre: admin.nombre,
          apellido: admin.apellido,
          username: admin.username,
          role,
          superadmin: admin.superadmin,
        },
      });
    } catch (e) {
      return res.status(401).json({ message: e.message || "Credenciales incorrectas" });
    }
  },

  // ---------------- CREAR ADMIN (solo SuperAdmin) ----------------
  async crearAdmin(req, res) {
    try {
      if (!req.user?.superadmin) return res.status(403).json({ message: "Solo el SuperAdmin puede crear Admins" });

      const { username, password, nombre, apellido, superadmin } = req.body;
      if (!username || !password || !nombre || !apellido) return res.status(400).json({ message: "Faltan campos" });

      const nuevo = await AdminService.crearAdmin(
        { username: username.trim(), password, nombre: nombre.trim(), apellido: apellido.trim(), superadmin: !!superadmin },
        req.user
      );

      return res.status(201).json({
        message: "✅ Admin creado correctamente",
        admin: {
          _id: nuevo._id,
          username: nuevo.username,
          nombre: nuevo.nombre,
          apellido: nuevo.apellido,
          superadmin: nuevo.superadmin,
        },
      });
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }
  },

  // ---------------- CREAR STAFF (Admin o SuperAdmin) ----------------
  async crearStaff(req, res) {
    try {
      if (!req.user || !["admin", "superadmin"].includes(req.user.role))
        return res.status(403).json({ message: "Solo un Admin o SuperAdmin puede crear Staff" });

      const { username, password, nombre, apellido, permisos } = req.body;
      if (!username || !password || !nombre || !apellido) return res.status(400).json({ message: "Faltan campos" });

      const nuevo = await AdminService.crearStaff(
        {
          username: username.trim(),
          password,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          permisos: Array.isArray(permisos) ? permisos : [],
        },
        req.user
      );

      return res.status(201).json({
        message: "✅ Staff creado correctamente",
        staff: {
          _id: nuevo._id,
          username: nuevo.username,
          nombre: nuevo.nombre,
          apellido: nuevo.apellido,
          role: nuevo.role,
          permisos: nuevo.permisos,
        },
      });
    } catch (e) {
      return res.status(403).json({ message: e.message });
    }
  },

  // ---------------- LISTAR ADMINS Y STAFF ----------------
  async listar(req, res) {
    try {
      const lista = await AdminService.listarAdminsYStaff();
      return res.json(lista);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  // ---------------- BUSCAR USUARIO POR CUIT ----------------
  async buscarUsuario(req, res) {
    try {
      const { cuit } = req.query;
      if (!cuit) return res.status(400).json({ message: "CUIT requerido" });

      const user = await UserRepository.findByCuit(cuit);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

      return res.json({
        empresa: user.empresa,
        cuit: user.cuit,
        contacto: user.contacto,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  // ---------------- PERFIL DEL ADMIN ----------------
  async me(req, res) {
    return res.json({ user: req.user });
  },

  // ---------------- LOGOUT ----------------
  async logout(req, res) {
    clearAllAuthCookies(res);
    return res.json({ message: "Sesión cerrada" });
  },
};
