import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('api/empresa')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ✅ LOGIN EMPRESA (LOCAL + PRODUCCIÓN)
  @Post('login')
  async loginEmpresa(
    @Body('cuit') cuit: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, empresa } = await this.authService.loginEmpresa(cuit, password);

    res.cookie('asmel_empresa_token', token, {
  httpOnly: true,
  secure: true,          // ✅ SIEMPRE TRUE EN PRODUCCIÓN
  sameSite: 'none',      // ✅ OBLIGATORIO PARA VERCEL + RENDER
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
    res.clearCookie('asmel_empresa_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
    });

    return { message: 'Logout exitoso' };
  }
}
