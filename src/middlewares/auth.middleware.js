// src/middlewares/auth.middleware.js
// ---------------------------------------------------------------------
// Middleware de autenticación ASMEL
// - Valida JWT desde cookies
// - Controla acceso por rol y permisos
// - Incluye alias 'authRequired' para compatibilidad
// ---------------------------------------------------------------------

import jwt from "jsonwebtoken";
import { JWT_SECRET, COOKIE_USER, COOKIE_STAFF, COOKIE_ADMIN } from "../utils/jwt.js";

// ---------------------------------------------------------------------
// 🧱 Construcción de objeto usuario desde el token
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

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

// ---------------------------------------------------------------------
// 🔒 Validación para usuarios tipo "empresa"
// ---------------------------------------------------------------------
export const authUserRequired = (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_USER];
    if (!token) return res.status(401).json({ message: "No autenticado" });

    req.user = buildUser(verifyToken(token));
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Acceso solo para Usuario" });

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// ---------------------------------------------------------------------
// 🔒 Validación para staff, admin y superadmin
// ---------------------------------------------------------------------
export const authStaffRequired = (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_STAFF] || req.cookies[COOKIE_ADMIN];
    if (!token) return res.status(401).json({ message: "No autenticado" });

    req.user = buildUser(verifyToken(token));

    if (!["staff", "admin", "superadmin"].includes(req.user.role))
      return res
        .status(403)
        .json({ message: "Acceso solo para Staff o Admin" });

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// ---------------------------------------------------------------------
// 🔒 Validación para administradores y superadministradores
// ---------------------------------------------------------------------
export const authAdminRequired = (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_ADMIN];
    if (!token) return res.status(401).json({ message: "No autenticado" });

    req.user = buildUser(verifyToken(token));

    if (!["admin", "superadmin"].includes(req.user.role))
      return res
        .status(403)
        .json({ message: "Acceso solo para Admin o SuperAdmin" });

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// ---------------------------------------------------------------------
// 🧩 Middleware de SuperAdmin
// ---------------------------------------------------------------------
export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role === "superadmin") return next();
  return res.status(403).json({ message: "Solo SuperAdmin" });
};

// ---------------------------------------------------------------------
// 🎯 Validación de permisos (permite cualquiera de los listados)
// Ejemplo: requirePermisos("turnos", "examenes") → basta con tener uno
// ---------------------------------------------------------------------
export const requirePermisos = (...allowed) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) return res.status(401).json({ message: "No autenticado" });

  // Admin y SuperAdmin pasan siempre
  if (["admin", "superadmin"].includes(role)) return next();

  // Solo staff tiene permisos verificables
  if (role !== "staff")
    return res.status(403).json({ message: "Acceso denegado" });

  const permisos = req.user.permisos || [];
  const ok = allowed.some((p) => permisos.includes(p)); // ✅ OR lógico

  if (!ok)
    return res.status(403).json({
      message: `Permisos insuficientes. Se requiere alguno de: ${allowed.join(", ")}`,
    });

  next();
};

// ---------------------------------------------------------------------
// 🧩 Alias genérico para compatibilidad retroactiva
// - Detecta token en cualquiera de las cookies válidas
// - No restringe por rol, solo verifica autenticación
// ---------------------------------------------------------------------
export const authRequired = (req, res, next) => {
  const token =
    req.cookies[COOKIE_USER] ||
    req.cookies[COOKIE_STAFF] ||
    req.cookies[COOKIE_ADMIN];

  if (!token) return res.status(401).json({ message: "No autenticado" });

  try {
    req.user = buildUser(verifyToken(token));
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};
