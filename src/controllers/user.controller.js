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

  async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      console.log("🧾 [UserController.me] Datos enviados al front:", req.user);

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
