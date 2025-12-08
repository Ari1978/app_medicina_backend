import { Response } from 'express';
import { sign } from 'jsonwebtoken';

export function signEmpresaToken(payload: any) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Falta JWT_SECRET en las variables de entorno");
  }

  return sign(payload, secret, { expiresIn: '7d' });
}

export function setEmpresaCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('asmel_empresa_token', token, {
    httpOnly: true,
    secure: isProd,                    // ✅ TRUE en producción
    sameSite: isProd ? 'none' : 'lax', // ✅ NONE para Vercel → Render
    path: '/',                         // ✅ OBLIGATORIO
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearEmpresaCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie('asmel_empresa_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}
