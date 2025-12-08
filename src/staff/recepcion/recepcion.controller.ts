
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { RecepcionService } from './recepcion.service';

@Controller('recepcion')
export class RecepcionController {
  constructor(private readonly recepcionService: RecepcionService) {}

  // ----------------------------------------
  // ✅ TURNOS DEL DÍA
  // ----------------------------------------
  @Get('turnos-hoy')
  turnosDeHoy() {
    return this.recepcionService.turnosDeHoy();
  }

  // ----------------------------------------
  // ✅ BUSCADOR (nombre, dni, empresa)
  // ----------------------------------------
  @Get('buscar')
  buscar(@Query('query') query: string) {
    return this.recepcionService.buscar(query);
  }

  // ----------------------------------------
  // ✅ CONFIRMAR TURNO (habilita impresión)
  // ----------------------------------------
  @Patch('turnos/:id/confirmar')
  confirmar(@Param('id') id: string) {
    return this.recepcionService.confirmarTurno(id);
  }

  // ----------------------------------------
  // ✅ CAMBIAR ESTADO GENÉRICO
  // ----------------------------------------
  @Patch('turnos/:id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: string },
  ) {
    return this.recepcionService.cambiarEstado(id, body.estado);
  }

  // ----------------------------------------
  // ✅ DATOS PARA IMPRESIÓN (solo confirmados)
  // ----------------------------------------
  @Get('turnos/:id/imprimir')
  imprimir(@Param('id') id: string) {
    return this.recepcionService.datosParaImpresion(id);
  }
}
