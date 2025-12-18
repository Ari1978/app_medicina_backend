import { Response } from 'express';
import { sign } from 'jsonwebtoken';

const EMPRESA_COOKIE = 'asmel_empresa_token';

export function signEmpresaToken(payload: any) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Falta JWT_SECRET en las variables de entorno');
  }

  return sign(payload, secret, { expiresIn: '7d' });
}

export function setEmpresaCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(EMPRESA_COOKIE, token, {
    httpOnly: true,
    secure: isProd,                     // obligatorio con SameSite=None
    sameSite: isProd ? 'none' : 'lax',  // cross-site en prod
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearEmpresaCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie(EMPRESA_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}
