import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';

@ApiTags('Auth - Empresa')
@Controller('api/empresa')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ===============================
  // LOGIN EMPRESA
  // ===============================
  @ApiOperation({
    summary: 'Login de empresa',
    description:
      'Autentica una empresa y setea la cookie asmel_empresa_token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cuit: {
          type: 'string',
          example: '20123456789',
        },
        password: {
          type: 'string',
          example: 'empresa123',
        },
      },
      required: ['cuit', 'password'],
    },
  })
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
      secure: isProd, // ✅ solo true en producción
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return empresa;
  }

  // ===============================
  // SESIÓN EMPRESA
  // ===============================
  @ApiOperation({
    summary: 'Obtener empresa autenticada',
  })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user;
  }

  // ===============================
  // LOGOUT EMPRESA
  // ===============================
  @ApiOperation({
    summary: 'Logout de empresa',
    description: 'Elimina la cookie de sesión',
  })
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
