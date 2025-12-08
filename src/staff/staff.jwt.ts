
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';

export const STAFF_COOKIE = 'asmel_staff_token';

export function signStaffToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '1d',
  });
}

export function setStaffCookie(res: Response, token: string) {
  res.cookie(STAFF_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearStaffCookie(res: Response) {
  res.clearCookie(STAFF_COOKIE);
}
