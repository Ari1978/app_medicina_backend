// src/utils/jwt.js
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "mi_clave_super_secreta";

// Cookies
export const COOKIE_USER  = "asmel_user_token";
export const COOKIE_STAFF = "asmel_staff_token";
export const COOKIE_ADMIN = "asmel_admin_token";

const isProd = process.env.NODE_ENV === "production";

/**
 * Genera un token JWT a partir de un payload arbitrario
 * @param {object} payload - Datos a codificar en el token
 * @param {string} expiresIn - Tiempo de expiración (opcional)
 */
export const signToken = (payload, expiresIn = "7d") =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

/**
 * Setea la cookie de autenticación
 * @param {Response} res - Response de Express
 * @param {string} cookieName - Nombre de la cookie
 * @param {string} token - JWT
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
 * @param {Response} res - Response de Express
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
