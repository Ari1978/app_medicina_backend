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
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
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

  // ===============================
  // CREAR TURNO
  // ===============================
  @ApiOperation({
    summary: 'Crear un turno',
  })
  @UseGuards(JwtEmpresaGuard)
  @Post()
  crear(@Req() req: Request, @Body() dto: CreateTurnoDto) {
    const empresa = req.user as { id: string };
    return this.turnoService.crearTurno(empresa.id, dto);
  }

  // ===============================
  // LISTAR TODOS
  // ===============================
  @ApiOperation({
    summary: 'Listar todos los turnos de la empresa',
  })
  @UseGuards(JwtEmpresaGuard)
  @Get()
  listarTodos(@Req() req: Request) {
    const empresa = req.user as { id: string };
    return this.turnoService.listarTodos(empresa.id);
  }

  // ===============================
  // LISTAR POR FECHA
  // ===============================
  @ApiOperation({
    summary: 'Listar turnos de la empresa por fecha',
  })
  @ApiParam({
    name: 'fecha',
    example: '2025-01-31',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  @UseGuards(JwtEmpresaGuard)
  @Get(':fecha')
  listarPorFecha(@Req() req: Request, @Param('fecha') fecha: string) {
    const empresa = req.user as { id: string };
    return this.turnoService.listarPorDia(empresa.id, fecha);
  }

  // ===============================
  // CANCELAR TURNO
  // ===============================
  @ApiOperation({
    summary: 'Cancelar un turno',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
  @UseGuards(JwtEmpresaGuard)
  @Patch(':id/cancelar')
  cancelar(@Req() req: Request, @Param('id') id: string) {
    const empresa = req.user as { id: string };
    return this.turnoService.cancelarTurno(empresa.id, id);
  }

  // ===============================
  // CONFIRMAR TURNO
  // ===============================
  @ApiOperation({
    summary: 'Confirmar un turno',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
  @UseGuards(JwtEmpresaGuard)
  @Patch(':id/confirmar')
  confirmar(@Req() req: Request, @Param('id') id: string) {
    const empresa = req.user as { id: string };
    return this.turnoService.confirmarTurno(empresa.id, id);
  }

  // ===============================
  // DESCARGAR PDF DEL TURNO
  // ===============================
  @ApiOperation({
    summary: 'Descargar PDF del turno',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
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
  // VER RESULTADOS DEL TURNO
  // ===============================
  @ApiOperation({
    summary: 'Ver resultados del turno',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
  @UseGuards(JwtEmpresaGuard)
  @Get(':id/resultados')
  verResultados(@Param('id') id: string) {
    return this.turnoService.buscarPorId(id);
  }
}
