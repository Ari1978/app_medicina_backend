import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';

import { Response, Request } from 'express';

import { EmpresaService } from './empresa.service';

import {
  signEmpresaToken,
  setEmpresaCookie,
  clearEmpresaCookie,
} from './empresa.jwt';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';

import * as bcrypt from 'bcryptjs';

@ApiTags('Empresa - Auth & Perfil')
@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  // ============================================================
  // ✔ LOGIN EMPRESA
  // ============================================================
  @ApiOperation({
    summary: 'Login de empresa',
    description:
      'Autentica una empresa. Si mustChangePassword es true, requiere cambio de contraseña.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cuit: { type: 'string', example: '20123456789' },
        password: { type: 'string', example: 'empresa123' },
      },
      required: ['cuit', 'password'],
    },
  })
  @Post('login')
  async login(
    @Body() body: { cuit: string; password: string },
    @Res() res: Response,
  ) {
    const { cuit, password } = body;

    const empresa = await this.empresaService.findByCuit(cuit);

    if (!empresa) {
      return res.status(401).json({
        ok: false,
        message: 'CUIT incorrecto',
      });
    }

    const okPassword = await bcrypt.compare(password, empresa.password);

    if (!okPassword) {
      return res.status(401).json({
        ok: false,
        message: 'Password incorrecto',
      });
    }

    // ➤ Requiere cambio de contraseña
    if (empresa.mustChangePassword === true) {
      return res.status(200).json({
        ok: true,
        mustChangePassword: true,
        empresaId: empresa._id,
        numeroCliente: empresa.numeroCliente || null,
        message: 'Debe cambiar la contraseña antes de continuar',
      });
    }

    // ➤ Login normal
    const token = signEmpresaToken({
      id: empresa._id,
      role: 'empresa',
    });

    setEmpresaCookie(res, token);

    return res.json({
      ok: true,
      message: 'Login exitoso',
      empresa: {
        id: empresa._id,
        cuit: empresa.cuit,
        razonSocial: empresa.razonSocial,
        email1: empresa.email1,
        numeroCliente: empresa.numeroCliente || null,
      },
    });
  }

  // ============================================================
  // ✔ CAMBIO OBLIGATORIO DE PASSWORD
  // ============================================================
  @ApiOperation({
    summary: 'Cambio obligatorio de contraseña',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        empresaId: { type: 'string', example: '64f1b2c3a4...' },
        password: { type: 'string', example: 'NuevaPassword123' },
        repetirPassword: { type: 'string', example: 'NuevaPassword123' },
      },
      required: ['empresaId', 'password', 'repetirPassword'],
    },
  })
  @Post('cambiar-password')
  async cambiarPassword(
    @Body()
    body: {
      empresaId: string;
      password: string;
      repetirPassword: string;
    },
    @Res() res: Response,
  ) {
    const { empresaId, password, repetirPassword } = body;

    if (!password || !repetirPassword) {
      throw new BadRequestException('Debe completar ambas contraseñas');
    }

    if (password !== repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    await this.empresaService.resetPassword(empresaId, password);

    return res.json({
      ok: true,
      message: 'Contraseña actualizada correctamente. Ya puede iniciar sesión.',
    });
  }

  // ============================================================
  // ✔ PERFIL EMPRESA LOGUEADA
  // ============================================================
  @ApiOperation({
    summary: 'Obtener perfil de la empresa autenticada',
  })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const user = req.user as { id: string };
    const empresa = await this.empresaService.findById(user.id);

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return {
      id: empresa._id,
      cuit: empresa.cuit,
      razonSocial: empresa.razonSocial,
      email1: empresa.email1,
      numeroCliente: empresa.numeroCliente ?? null,
    };
  }

  // ============================================================
  // ✔ LOGOUT
  // ============================================================
  @ApiOperation({
    summary: 'Logout de empresa',
  })
  @Post('logout')
  async logout(@Res() res: Response) {
    clearEmpresaCookie(res);
    return res.json({ message: 'Logout OK' });
  }

  // ============================================================
  // ✔ BUSCADOR DE EMPRESAS
  // ============================================================
  @ApiOperation({
    summary: 'Buscar empresas',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    example: 'Metalúrgica',
  })
  @Get('buscar')
  async buscar(@Query('query') query: string) {
    return this.empresaService.buscarEmpresas(query);
  }
}
