import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  Param,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';

import { TurnoService } from './turno.service';
import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { Request, Response } from 'express';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { TurnoPdfService } from './turno-pdf.service';

@ApiTags('Empresa - Turnos')
@Controller('empresa/turnos')
export class TurnoController {
  constructor(
    private readonly turnoService: TurnoService,
    private readonly turnoPdfService: TurnoPdfService,
  ) {}

  // ✅ Lee el id real que venga del guard/strategy
  private getEmpresaId(req: Request): string {
    const u: any = req.user;

    const empresaId =
      u?.empresaId || // ✅ el más común
      u?.id ||        // a veces usan "id"
      u?._id ||       // a veces viene mongo _id
      u?.sub;         // a veces viene del JWT

    if (!empresaId) {
      // para que no te quede “undefined” y explote Mongoose
      throw new BadRequestException('No llega empresaId en req.user (JwtEmpresaGuard)');
    }

    return String(empresaId);
  }

  // ===============================
  // CREAR TURNO
  // ===============================
  @ApiOperation({ summary: 'Crear un turno' })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Post()
  crear(@Req() req: Request, @Body() dto: CreateTurnoDto) {
    const empresaId = this.getEmpresaId(req);
    return this.turnoService.crearTurno(empresaId, dto);
  }

  // ===============================
  // LISTAR TODOS
  // ===============================
  @ApiOperation({ summary: 'Listar todos los turnos de la empresa' })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get()
  listarTodos(@Req() req: Request) {
    const empresaId = this.getEmpresaId(req);
    return this.turnoService.listarTodos(empresaId);
  }

  // ===============================
  // LISTAR POR FECHA
  // ===============================
  @ApiOperation({ summary: 'Listar turnos de la empresa por fecha' })
  @ApiParam({
    name: 'fecha',
    example: '2025-01-31',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get(':fecha')
  listarPorFecha(@Req() req: Request, @Param('fecha') fecha: string) {
    const empresaId = this.getEmpresaId(req);
    return this.turnoService.listarPorDia(empresaId, fecha);
  }

  // ===============================
  // CANCELAR TURNO
  // ===============================
  @ApiOperation({ summary: 'Cancelar un turno' })
  @ApiParam({ name: 'id', description: 'ID del turno' })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Patch(':id/cancelar')
  cancelar(@Req() req: Request, @Param('id') id: string) {
    const empresaId = this.getEmpresaId(req);
    return this.turnoService.cancelarTurno(empresaId, id);
  }

  // ===============================
  // CONFIRMAR TURNO
  // ===============================
  @ApiOperation({ summary: 'Confirmar un turno' })
  @ApiParam({ name: 'id', description: 'ID del turno' })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Patch(':id/confirmar')
  confirmar(@Req() req: Request, @Param('id') id: string) {
    const empresaId = this.getEmpresaId(req);
    return this.turnoService.confirmarTurno(empresaId, id);
  }

  // ===============================
  // DESCARGAR PDF DEL TURNO
  // ===============================
  @ApiOperation({ summary: 'Descargar PDF del turno' })
  @ApiParam({ name: 'id', description: 'ID del turno' })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get(':id/pdf')
  async descargarPdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.turnoPdfService.generarPDF(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=turno-${id}.pdf`,
    });

    res.end(pdf);
  }

  // ===============================
  // VER RESULTADOS DEL TURNO (solo de ESA empresa)
  // ===============================
  @ApiOperation({ summary: 'Ver resultados del turno' })
  @ApiParam({ name: 'id', description: 'ID del turno' })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get(':id/resultados')
  verResultados(@Req() req: Request, @Param('id') id: string) {
    const empresaId = this.getEmpresaId(req);
    return this.turnoService.buscarPorIdEmpresa(empresaId, id);
  }
}
