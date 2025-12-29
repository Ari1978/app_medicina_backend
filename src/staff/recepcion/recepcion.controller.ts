import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { RecepcionService } from './recepcion.service';

import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { StaffPermisoGuard } from '../../auth/guards/staff-permiso.guard';

import { Roles } from '../../auth/decorators/roles.decorator';
import { StaffPermiso } from '../../auth/decorators/staff-permiso.decorator';

import { Role } from '../../auth/roles.enum';
import { StaffPermisoEnum } from '../../auth/enums/staff-permiso.enum';

@Controller('staff/recepcion')
@UseGuards(JwtStaffGuard, RolesGuard, StaffPermisoGuard)
@Roles(Role.Staff)
@StaffPermiso(StaffPermisoEnum.RECEPCION)
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
turnosPorFecha(
  @Query('fecha') fecha: string,
  @Res({ passthrough: true }) res: Response,
) {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  });

  return this.recepcionService.listarPorFechaGlobal(fecha);
}


  // =========================
  // CAMBIAR ESTADO
  // =========================
  @Patch('turnos/:id/estado')
  cambiarEstado(
    @Param('id') id: string,
    @Body('estado') estado: 'confirmado' | 'ausente',
  ) {
    return this.recepcionService.cambiarEstadoRecepcion(id, estado);
  }

  // =========================
  // DATOS PARA IMPRESIÓN (HTML / preview)
  // =========================
  @Get('turnos/:id/imprimir')
  datosParaImpresion(@Param('id') id: string) {
    return this.recepcionService.datosParaImpresion(id);
  }

  // =========================
  // PDF RECEPCIÓN (FINAL)
  // =========================
  @Get('turnos/:id/pdf')
  async imprimirPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdf = await this.recepcionService.generarPdfRecepcion(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=orden-recepcion.pdf',
    });

    res.send(pdf);
  }

  // =========================
// EDITAR DATOS DE POSTULANTE
// =========================
@Patch('turnos/:id/datos-postulante')
editarDatosPostulante(
  @Param('id') id: string,
  @Body()
  body: {
    empleadoNombre: string;
    empleadoApellido: string;
    empleadoDni: string;
  },
) {
  return this.recepcionService.editarDatosPostulante(id, body);
}

// =========================
// DAR DE ALTA COMO PACIENTE
// =========================
@Post('turnos/:id/alta-paciente')
darDeAltaComoPaciente(@Param('id') id: string) {
  return this.recepcionService.altaPacienteDesdeTurno(id);
}


}
