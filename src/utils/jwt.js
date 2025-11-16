// src/utils/jwt.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET =
  process.env.JWT_SECRET || "mi_clave_secreta_super_segura";

// Nombres de cookies (unificados)
export const COOKIE_USER = "asmel_user_token";
export const COOKIE_STAFF = "asmel_staff_token";
export const COOKIE_ADMIN = "asmel_admin_token";

const isProd = process.env.NODE_ENV === "production";

/**
 * Firma genérica de token
 */
export const signToken = (payload, expiresIn = "3h") =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

/**
 * Setea cookie de autenticación
 */
export const setAuthCookie = (res, cookieName, token) => {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });
};

/**
 * Limpia todas las cookies de autenticación
 */
export const clearAllAuthCookies = (res) => {
  [COOKIE_USER, COOKIE_STAFF, COOKIE_ADMIN].forEach((c) =>
    res.clearCookie(c, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    })
  );
};

/**
 * Token para usuario empresa (User)
 * OJO: tu modelo User no tiene nombre/apellido/email top-level,
 * así que armamos el payload con empresa + contacto.
 */
export function generateTokenForUser(user) {
  const payload = {
    _id: user._id,
    role: "user",
    empresa: user.empresa,
    cuit: user.cuit,
    contacto: {
      nombre: user.contacto?.nombre || "",
      email: user.contacto?.email || "",
      telefono: user.contacto?.telefono || "",
    },
  };
  return signToken(payload);
}

/**
 * Token para Staff
 */
export function generateTokenForStaff(staff) {
  const payload = {
    _id: staff._id,
    role: "staff",
    username: staff.username,
    nombre: staff.nombre,
    apellido: staff.apellido,
    permisos: Array.isArray(staff.permisos) ? staff.permisos : [],
  };
  return signToken(payload);
}

/**
 * Token para Admin o SuperAdmin
 */
export function generateTokenForAdmin(admin) {
  const payload = {
    _id: admin._id,
    role: admin.superadmin ? "superadmin" : "admin",
    nombre: admin.nombre,
    apellido: admin.apellido,
    username: admin.username,
    superadmin: !!admin.superadmin,
  };
  return signToken(payload);
}
