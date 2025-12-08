import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth/empresa')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async loginEmpresa(
    @Body('cuit') cuit: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, empresa } = await this.authService.loginEmpresa(cuit, password);

    res.cookie('asmel_empresa_token', token, {
      httpOnly: true,
      secure: false, // en producción poner true
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return empresa;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('asmel_empresa_token');
    return { message: 'Logout exitoso' };
  }
}
