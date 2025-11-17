// src/controllers/user.controller.js
import { UserService } from "../services/user.service.js";
import {
  clearAllAuthCookies,
  setAuthCookie,
  COOKIE_USER,
  generateTokenForUser,
} from "../utils/jwt.js";
import { userResponseDTO } from "../dto/user.dto.js";
import { UserRepository } from "../repositories/user.repository.js";
import { LoginDTO } from "../dto/login.dto.js";

export const UserController = {

  // ============================================================
  // 🚀 REGISTRO EMPRESA VALIDADO POR CUIT
  // ============================================================
  async register(req, res) {
    try {
      const { cuit, email, password, contacto } = req.body;

      // 1) Validar CUIT
      if (!cuit?.trim()) {
        return res.status(400).json({ message: "CUIT requerido" });
      }

      // 2) Buscar CUIT en la DB (creado por SuperAdmin)
      const empresaBase = await UserRepository.findByCuit(cuit.trim());
      if (!empresaBase) {
        return res.status(403).json({
          message: "Empresa no autorizada. Contactar a ASMEL.",
        });
      }

      // 3) Ver si YA se registró
      if (empresaBase.password) {
        return res.status(400).json({
          message: "Esta empresa ya completó su registro.",
        });
      }

      // 4) Actualizar datos del registro
      const user = await UserService.completarRegistro(empresaBase._id, {
        email: email?.trim() || empresaBase.contacto?.email || "",
        password,
        contacto,
      });

      return res.status(201).json({
        message: "Registro completado correctamente",
        user: userResponseDTO(user),
      });

    } catch (e) {
      console.error("❌ Error en register:", e.message);
      return res.status(400).json({ message: e.message });
    }
  },

  // ============================================================
  // LOGIN
  // ============================================================
  async login(req, res) {
    try {
      const { cuit, password } = new LoginDTO(req.body);

      const user = await UserService.login(cuit, password);

      clearAllAuthCookies(res);

      const token = generateTokenForUser(user);
      setAuthCookie(res, COOKIE_USER, token);

      return res.json({
        message: "OK",
        user: userResponseDTO(user),
        token,
      });
    } catch (e) {
      console.error("❌ Error en login:", e.message);
      return res.status(401).json({ message: e.message });
    }
  },

  // ============================================================
  // /ME
  // ============================================================
  async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      return res.json({
        user: userResponseDTO(req.user),
      });
    } catch (err) {
      console.error("❌ Error en /me:", err);
      return res.status(500).json({ message: "Error al obtener usuario" });
    }
  },

  async logout(_req, res) {
    clearAllAuthCookies(res);
    return res.json({ message: "👋 Sesión cerrada correctamente" });
  },

  // ============================================================
  // VALIDAR CUIT ANTES DEL REGISTRO
  // ============================================================
  async checkCuit(req, res) {
    try {
      const { cuit } = req.body;

      if (!cuit || !cuit.trim()) {
        return res.status(400).json({ message: "CUIT requerido" });
      }

      const empresa = await UserRepository.findByCuit(cuit.trim());
      if (!empresa) {
        return res
          .status(404)
          .json({ message: "CUIT no habilitado. Contactar a Asmel" });
      }

      return res.json({
        cuit: empresa.cuit,
        nombre: empresa.empresa || empresa.nombre,
        email: empresa.contacto?.email || "",
      });
    } catch (err) {
      console.error("❌ Error checkCuit:", err);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },
};
