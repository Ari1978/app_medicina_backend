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
  res.cookie('asmel_empresa_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearEmpresaCookie(res: Response) {
  res.clearCookie('asmel_empresa_token');
}
