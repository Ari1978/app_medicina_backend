import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('api/empresa')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ✅ LOGIN EMPRESA (LOCAL + FLY)
  @Post('login')
  async loginEmpresa(
    @Body('cuit') cuit: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, empresa } =
      await this.authService.loginEmpresa(cuit, password);

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('asmel_empresa_token', token, {
      httpOnly: true,
      secure: isProd,          // ✅ SOLO TRUE EN PRODUCCIÓN
      sameSite: isProd ? 'none' : 'lax', // ✅ LOCAL vs FLY
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return empresa;
  }

  // ✅ SESIÓN EMPRESA
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    return req.user;
  }

  // ✅ LOGOUT EMPRESA
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('asmel_empresa_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'Logout exitoso' };
  }
}
