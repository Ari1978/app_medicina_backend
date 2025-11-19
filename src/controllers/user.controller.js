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
import EmpresaPrecargada from "../models/empresaPrecargada.model.js";

export const UserController = {

  /* ===============================
      ✔ VALIDAR CUIT (registro)
  ================================ */
  async checkCuit(req, res) {
    try {
      const { cuit } = req.body;

      if (!cuit) {
        return res.status(400).json({ message: "CUIT requerido" });
      }

      // 1) Revisar empresas precargadas habilitadas
      const pre = await EmpresaPrecargada.findOne({ cuit, habilitado: true });
      if (!pre) {
        return res.status(404).json({
          message: "Esta empresa no está habilitada para registrarse",
        });
      }

      // 2) Verificar si ya está registrada
      const user = await UserRepository.findByCuit(cuit);
      if (user) {
        return res.status(400).json({
          message: "Esta empresa ya está registrada",
        });
      }

      return res.json({
        cuit,
        empresa: pre.empresa,
        nombre: "",
        email: "",
      });

    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  /* ===============================
      📝 REGISTRAR EMPRESA
  ================================ */
 async register(req, res) {
  try {
    const { cuit, password, contacto } = req.body;

    if (!cuit || !password || !contacto?.email || !contacto?.nombre) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // 1) Debe existir en EmpresaPrecargada
    const pre = await EmpresaPrecargada.findOne({ cuit, habilitado: true });
    if (!pre) {
      return res.status(400).json({
        message: "La empresa no está habilitada para registrarse",
      });
    }

    // 2) Buscar si ya existe un User real
    let user = await UserRepository.findByCuit(cuit);

    if (!user) {
      // ⚠ IMPORTANTE: contacto SIEMPRE se guarda ahora recién en el registro
      user = await UserRepository.crear({
        empresa: pre.empresa,
        cuit,
        password,
        role: "user",
        contacto: {
          nombre: contacto.nombre,
          email: contacto.email,
        },
      });
    } else {
      // Si ya existe → actualizarlo SIN permitir email vacío
      user.contacto.nombre = contacto.nombre;
      if (contacto.email) user.contacto.email = contacto.email;

      user.password = password;
      await user.save();
    }

    // 3) Marcar como registrada
    pre.habilitado = false;
    await pre.save();

    return res.status(201).json({ message: "Registro exitoso" });
  } catch (e) {
    console.error("❌ Error en register:", e);
    return res.status(500).json({ message: e.message });
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
};
