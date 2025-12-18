// src/recepcion/recepcion.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';
import { RecepcionService } from './recepcion.service';

@UseGuards(JwtStaffGuard)
@Controller('recepcion')
export class RecepcionController {
  constructor(private readonly recepcionService: RecepcionService) {}

  // =========================
  // TURNOS DE HOY
  // =========================
  @Get('turnos-hoy')
  turnosDeHoy() {
    return this.recepcionService.turnosDeHoy();
  }

  // =========================
  // TURNOS POR FECHA
  // =========================
  @Get('turnos')
  turnosPorFecha(@Query('fecha') fecha: string) {
    return this.recepcionService.listarPorFechaGlobal(fecha);
  }

  // =========================
  // BUSCADOR
  // =========================
  @Get('buscar')
  buscar(@Query('query') query: string) {
    return this.recepcionService.buscar(query);
  }

  // =========================
  // CAMBIAR ESTADO (confirmado / ausente)
  // =========================
  @Patch('turnos/:id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body('estado') estado: 'confirmado' | 'ausente',
  ) {
    return this.recepcionService.cambiarEstadoRecepcion(id, estado);
  }

  // =========================
  // DATOS PARA IMPRESIÓN
  // =========================
  @Get('turnos/:id/imprimir')
  imprimir(@Param('id') id: string) {
    return this.recepcionService.datosParaImpresion(id);
  }
}
