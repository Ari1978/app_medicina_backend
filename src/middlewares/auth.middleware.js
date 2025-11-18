// src/middlewares/auth.middleware.js
// ---------------------------------------------------------------------
// Middleware ASMEL - Autenticación + Roles + Permisos
// ---------------------------------------------------------------------

import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  COOKIE_USER,
  COOKIE_STAFF,
  COOKIE_ADMIN,
} from "../utils/jwt.js";

// ---------------------------------------------------------------------
// 🧱 Construye un objeto usuario limpio para req.user
// ---------------------------------------------------------------------
const buildUser = (decoded) => {
  const role = (decoded.role || "").toLowerCase();

  return {
    _id: decoded._id,
    role,
    superadmin: role === "superadmin",
    permisos: decoded.permisos || [],
    nombre: decoded.nombre,
    apellido: decoded.apellido,
    username: decoded.username,
    cuit: decoded.cuit,
    email: decoded.email,
  };
};

// ---------------------------------------------------------------------
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

// ---------------------------------------------------------------------
// 🔐 1) Para usuarios tipo "empresa"
// ---------------------------------------------------------------------
export const authUserRequired = (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_USER];
    if (!token) return res.status(401).json({ message: "No autenticado" });

    req.user = buildUser(verifyToken(token));

    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Acceso solo para Usuario" });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// ---------------------------------------------------------------------
// 🔐 2) Staff (staff/admin/superadmin)
// ---------------------------------------------------------------------
export const authStaffRequired = (req, res, next) => {
  try {
    const token =
      req.cookies[COOKIE_STAFF] ||
      req.cookies[COOKIE_ADMIN];

    if (!token) return res.status(401).json({ message: "No autenticado" });

    req.user = buildUser(verifyToken(token));

    if (!["staff", "admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Acceso solo para Staff/Admin" });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// ---------------------------------------------------------------------
// 🔐 3) Administradores y SuperAdmins
// ---------------------------------------------------------------------
export const authAdminRequired = (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_ADMIN];
    if (!token) return res.status(401).json({ message: "No autenticado" });

    req.user = buildUser(verifyToken(token));

    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Acceso solo para Admin/SuperAdmin" });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// ---------------------------------------------------------------------
// 🔐 4) SuperAdmin puro
// ---------------------------------------------------------------------
export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role === "superadmin") return next();
  return res.status(403).json({ message: "Solo SuperAdmin" });
};

// ---------------------------------------------------------------------
// 🔐 5) Permisos (sistema interno del staff)
// ---------------------------------------------------------------------
export const requirePermisos = (...allowed) => (req, res, next) => {
  const role = req.user?.role;

  if (!role) return res.status(401).json({ message: "No autenticado" });

  // Admin y SuperAdmin pasan siempre
  if (["admin", "superadmin"].includes(role)) return next();

  // Usuarios empresa NO tienen permisos internos
  if (role !== "staff") {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  const permisos = req.user.permisos || [];
  const ok = allowed.some((p) => permisos.includes(p));

  if (!ok) {
    return res.status(403).json({
      message: `Permisos insuficientes. Se requiere alguno de: ${allowed.join(", ")}`,
    });
  }

  next();
};

// ---------------------------------------------------------------------
// 🧩 6) Alias genérico (acepta cualquier rol autenticado)
//     Ideal para rutas comunes como /user/me
// ---------------------------------------------------------------------
export const authRequired = (req, res, next) => {
  try {
    const token =
      req.cookies[COOKIE_USER] ||
      req.cookies[COOKIE_STAFF] ||
      req.cookies[COOKIE_ADMIN];

    if (!token) return res.status(401).json({ message: "No autenticado" });

    req.user = buildUser(verifyToken(token));

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// ---------------------------------------------------------------------
// 🔐 7) Permiso especial para gestionar perfiles de examen
//     SuperAdmin OR Staff con permisos: examenes / marketing
// ---------------------------------------------------------------------
export const requirePerfilManager = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  // SuperAdmin siempre permitido
  if (user.role === "superadmin") return next();

  // Staff debe tener permisos especiales
  if (user.role === "staff") {
    const permisos = user.permisos || [];
    if (permisos.includes("examenes") || permisos.includes("marketing")) {
      return next();
    }
  }

  return res.status(403).json({
    message: "Acceso denegado: requiere permiso de Exámenes o Marketing",
  });
};
