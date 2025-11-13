// src/utils/jwt.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_secreta_super_segura";

// Nombres de cookies (unificados)
export const COOKIE_USER = "asmel_user_token";
export const COOKIE_STAFF = "asmel_staff_token";
export const COOKIE_ADMIN = "asmel_admin_token";

/**
 * Genera token para usuario empresa (User)
 * payload contiene: _id, role, nombre, cuit, email
 */
export function generateTokenForUser(user) {
  const payload = {
    _id: user._id,
    role: "user",
    nombre: user.nombre,
    cuit: user.cuit,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "3h" });
}

/**
 * Genera token para Staff
 * payload contiene: _id, role, username, nombre, apellido, permisos[]
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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "3h" });
}

/**
 * Genera token para Admin o SuperAdmin
 * payload contiene: _id, role, nombre, apellido, username
 */
export function generateTokenForAdmin(admin) {
  const payload = {
    _id: admin._id,
    role: admin.role === "superadmin" ? "superadmin" : "admin",
    nombre: admin.nombre,
    apellido: admin.apellido,
    username: admin.username,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "3h" });
}
