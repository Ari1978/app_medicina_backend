
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';

export const ADMIN_COOKIE = 'asmel_admin_token';

export function signAdminToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
}

export function setAdminCookie(res: Response, token: string) {
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE);
}
