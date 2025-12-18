import { Response } from 'express';
import * as jwt from 'jsonwebtoken';

export const ADMIN_COOKIE = 'asmel_admin_token';

export function signAdminToken(payload: any) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Falta JWT_SECRET en las variables de entorno');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '1d',
  });
}

export function setAdminCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: isProd,                    // ✅ TRUE en producción
    sameSite: isProd ? 'strict' : 'lax', // ✅ 'strict' para producción y 'lax' en desarrollo
    path: '/',                         // ✅ OBLIGATORIO
    maxAge: 24 * 60 * 60 * 1000,        // 1 día
  });
}

export function clearAdminCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie(ADMIN_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
  });
}
