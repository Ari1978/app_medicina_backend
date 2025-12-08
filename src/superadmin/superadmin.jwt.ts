import { Response } from 'express';

export const COOKIE_SUPERADMIN = 'asmel_superadmin_token';

export function setSuperAdminCookie(res: Response, token: string) {
  res.cookie(COOKIE_SUPERADMIN, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearSuperAdminCookie(res: Response) {
  res.clearCookie(COOKIE_SUPERADMIN);
}
