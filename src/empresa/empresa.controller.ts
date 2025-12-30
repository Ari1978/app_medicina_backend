import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Query,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { EmpresaService } from './empresa.service';
import {
  signEmpresaToken,
  setEmpresaCookie,
  clearEmpresaCookie,
} from './empresa.jwt';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { TurnoService } from '../turno/turno.service';

@ApiTags('Empresa - Auth & Perfil')
@Controller('empresa') // ✅ prefijo correcto
export class EmpresaController {
  constructor(
    private readonly empresaService: EmpresaService,
    private readonly turnosService: TurnoService,
  ) {}

  // ============================================================
  // LOGIN EMPRESA
  // ============================================================
  @ApiOperation({ summary: 'Login de empresa' })
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
    @Res({ passthrough: true }) res: Response,
  ) {
    const { cuit, password } = body;

    const empresa = await this.empresaService.validarCredenciales(cuit, password);


    if (empresa.mustChangePassword) {
      return {
        ok: true,
        mustChangePassword: true,
        empresaId: empresa._id,
        numeroCliente: empresa.numeroCliente || null,
        message: 'Debe cambiar la contraseña antes de continuar',
      };
    }

    const token = signEmpresaToken({
      empresaId: empresa._id.toString(),
      role: 'empresa',
    });

    setEmpresaCookie(res, token);

    return {
      ok: true,
      message: 'Login exitoso',
      empresa: {
        id: empresa._id,
        cuit: empresa.cuit,
        razonSocial: empresa.razonSocial,
        email1: empresa.email1,
        numeroCliente: empresa.numeroCliente || null,
      },
    };
  }

  // ============================================================
  // PERFIL EMPRESA LOGUEADA
  // ============================================================
  @ApiOperation({
    summary: 'Obtener perfil de la empresa autenticada',
  })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get('me')
  async me(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.set({
      'Cache-Control':
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    const user = req.user as { empresaId: string };

    const empresa =
      await this.empresaService.findById(user.empresaId);
    if (!empresa)
      throw new NotFoundException('Empresa no encontrada');

    return {
      id: empresa._id,
      cuit: empresa.cuit,
      razonSocial: empresa.razonSocial,
      email1: empresa.email1,
      numeroCliente: empresa.numeroCliente || null,
      role: 'empresa',
    };
  }

  // ============================================================
  // LOGOUT
  // ============================================================
  @ApiOperation({ summary: 'Logout de empresa' })
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    clearEmpresaCookie(res);
    return { ok: true, message: 'Logout OK' };
  }

  // ============================================================
  // BUSCAR EMPRESAS
  // ============================================================
  @ApiOperation({ summary: 'Buscar empresas' })
  @ApiQuery({
    name: 'query',
    required: false,
    example: 'Metalúrgica',
  })
  @Get('buscar')
  async buscar(@Query('query') query: string) {
    return this.empresaService.buscarEmpresas(query);
  }

  // ============================================================
  // DESCARGAR PDF RESUMEN TURNO
  // ============================================================
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get('turnos/:id/pdf-resumen')
  async descargarPdfResumen(
    @Param('id') turnoId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer =
      await this.turnosService.generarPdfResumen(turnoId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename=informe-turno.pdf',
    });

    res.end(pdfBuffer);
  }
}
