// src/servicios/auth/servicios.jwt.ts
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';

export const SERVICIO_COOKIE = 'asmel_servicio_token';

export function signServicioToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
}

export function setServicioCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(SERVICIO_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}

export function clearServicioCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie(SERVICIO_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}
