// src/turno/turno.controller.ts
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

import { TurnoService } from './turno.service';
import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { Request, Response } from 'express';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { TurnoPdfService } from './turno-pdf.service';

@Controller('empresa/turnos')
export class TurnoController {
  constructor(
    private readonly turnoService: TurnoService,
    private readonly turnoPdfService: TurnoPdfService,
  ) {}

  @UseGuards(JwtEmpresaGuard)
  @Post()
  crear(@Req() req: Request, @Body() dto: CreateTurnoDto) {
    const empresa = req.user as { id: string };
    return this.turnoService.crearTurno(empresa.id, dto);
  }

  @UseGuards(JwtEmpresaGuard)
  @Get()
  listarTodos(@Req() req: Request) {
    const empresa = req.user as { id: string };
    return this.turnoService.listarTodos(empresa.id);
  }

  @UseGuards(JwtEmpresaGuard)
  @Get(':fecha')
  listarPorFecha(@Req() req: Request, @Param('fecha') fecha: string) {
    const empresa = req.user as { id: string };
    return this.turnoService.listarPorDia(empresa.id, fecha);
  }

  @UseGuards(JwtEmpresaGuard)
  @Patch(':id/cancelar')
  cancelar(@Req() req: Request, @Param('id') id: string) {
    const empresa = req.user as { id: string };
    return this.turnoService.cancelarTurno(empresa.id, id);
  }

  @UseGuards(JwtEmpresaGuard)
  @Patch(':id/confirmar')
  confirmar(@Req() req: Request, @Param('id') id: string) {
    const empresa = req.user as { id: string };
    return this.turnoService.confirmarTurno(empresa.id, id);
  }

  // 📄 DESCARGA DE PDF DEL TURNO
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
}
