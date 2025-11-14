// src/controllers/user.controller.js
import { UserService } from "../services/user.service.js";
import {
  clearAllAuthCookies,
  setAuthCookie,
  signToken,
  COOKIE_USER,
} from "../utils/jwt.js";
import { userResponseDTO } from "../dto/user.dto.js";
import { UserRepository } from "../repositories/user.repository.js";

export const UserController = {
  // ------------------------ REGISTRO ------------------------
  async register(req, res) {
    try {
      const user = await UserService.register(req.body);

      return res.status(201).json({
        message: "✅ Registro exitoso",
        user: userResponseDTO(user),
      });
    } catch (e) {
      console.error("❌ Error en register:", e.message);
      return res.status(400).json({ message: e.message });
    }
  },

  // ------------------------- LOGIN --------------------------
  async login(req, res) {
    try {
      const cuit = req.body.cuit?.trim();
      const password = req.body.password;

      const user = await UserService.login(cuit, password);

      // Limpiar cookies previas (admin / staff / user)
      clearAllAuthCookies(res);

      // Payload del JWT
      const payload = {
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        cuit: user.cuit,
        email: user.email,
        role: "user",
        permisos: [],
        superadmin: false,
      };

      // Firmar token
      const token = signToken(payload);

      // Setear cookie segura
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

  // --------------------------- ME ---------------------------
  async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      // Log útil en modo desarrollo
      console.log("🧾 [UserController.me] Datos enviados al front:", req.user);

      return res.json({
        user: userResponseDTO(req.user),
      });
    } catch (err) {
      console.error("❌ Error en /me:", err);
      return res.status(500).json({ message: "Error al obtener usuario" });
    }
  },

  // ------------------------ LOGOUT --------------------------
  async logout(req, res) {
    clearAllAuthCookies(res);
    return res.json({ message: "👋 Sesión cerrada correctamente" });
  },

  // -------------------- VALIDAR CUIT ------------------------
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
        email: empresa.email,
      });
    } catch (err) {
      console.error("❌ Error checkCuit:", err);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  },
};
