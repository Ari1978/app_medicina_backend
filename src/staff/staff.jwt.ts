import { Response } from 'express';
import * as jwt from 'jsonwebtoken';

export const STAFF_COOKIE = 'asmel_staff_token';

export function signStaffToken(payload: any) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Falta JWT_SECRET en las variables de entorno');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '1d',
  });
}

export function setStaffCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(STAFF_COOKIE, token, {
    httpOnly: true,
    secure: isProd,                    // ✅ TRUE en producción
    sameSite: isProd ? 'none' : 'lax', // ✅ NONE para cross-site
    path: '/',                         // ✅ OBLIGATORIO
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearStaffCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie(STAFF_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}
