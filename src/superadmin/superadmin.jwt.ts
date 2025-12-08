import { Response } from 'express';

export const COOKIE_SUPERADMIN = 'asmel_superadmin_token';

export function setSuperAdminCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_SUPERADMIN, token, {
    httpOnly: true,
    secure: isProd,                    // ✅ TRUE en producción
    sameSite: isProd ? 'none' : 'lax', // ✅ NONE para cross-site
    path: '/',                         // ✅ OBLIGATORIO
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearSuperAdminCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie(COOKIE_SUPERADMIN, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
}
