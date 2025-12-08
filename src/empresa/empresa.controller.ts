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
} from '@nestjs/common';
import { Response, Request } from 'express';

import { EmpresaService } from './empresa.service';

import {
  signEmpresaToken,
  setEmpresaCookie,
  clearEmpresaCookie,
} from './empresa.jwt';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';

import * as bcrypt from 'bcryptjs';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  // ------------------------------------------------------------
  // ✅ LOGIN CON CLAVE GENÉRICA + CONTROL DE PRIMER ACCESO
  // ------------------------------------------------------------
@Post('login')
async login(
  @Body() body: { cuit: string; password: string },
  @Res() res: Response,
) {
  console.log('==============================');
  console.log('✅ [LOGIN EMPRESA] INICIO');
  console.log('📩 Body recibido:', body);

  const { cuit, password } = body;

  const empresa = await this.empresaService.findByCuit(cuit);
  console.log('🏢 Empresa encontrada:', empresa ? empresa._id : 'NO EXISTE');

  if (!empresa) {
    console.log('❌ CUIT INCORRECTO');
    return res.status(401).json({
      ok: false,
      message: 'CUIT incorrecto',
    });
  }

  const okPassword = await bcrypt.compare(password, empresa.password);
  console.log('🔐 Resultado bcrypt.compare:', okPassword);
  console.log('🔑 Password en DB (hash):', empresa.password);

  if (!okPassword) {
    console.log('❌ PASSWORD INCORRECTO');
    return res.status(401).json({
      ok: false,
      message: 'Password incorrecto',
    });
  }

  console.log('🚩 Valor de mustChangePassword:', empresa.mustChangePassword);

  // ✅ SI DEBE CAMBIAR CONTRASEÑA → NO SE CREA COOKIE
  if (empresa.mustChangePassword === true) {
    console.log('⚠️ PRIMER ACCESO - DEBE CAMBIAR CONTRASEÑA');

    return res.status(200).json({
      ok: true,
      mustChangePassword: true,
      empresaId: empresa._id,
      message: 'Debe cambiar la contraseña antes de continuar',
    });
  }

  console.log('✅ LOGIN NORMAL - SE CREA COOKIE');

  // ✅ LOGIN NORMAL
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
    },
  });
}


  // ------------------------------------------------------------
  // ✅ CAMBIO OBLIGATORIO DE PASSWORD (PRIMER ACCESO)
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // ✅ PERFIL EMPRESA LOGUEADA
  // ------------------------------------------------------------
  @UseGuards(JwtEmpresaGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.empresaService.findById(user.id);
  }

  // ------------------------------------------------------------
  // ✅ LOGOUT
  // ------------------------------------------------------------
  @Post('logout')
  async logout(@Res() res: Response) {
    clearEmpresaCookie(res);
    return res.json({ message: 'Logout OK' });
  }

  // ------------------------------------------------------------
  // ✅ BUSCADOR INCREMENTAL
  // ------------------------------------------------------------
  @Get('buscar')
  async buscar(@Query('query') query: string) {
    return this.empresaService.buscarEmpresas(query);
  }
}
