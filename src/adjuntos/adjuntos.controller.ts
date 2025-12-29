import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { AdjuntosService } from './adjuntos.service';
import { CreateAdjuntoDto } from './dto/create-adjunto.dto';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/roles.enum';

import { StaffPermisoGuard } from '../auth/guards/staff-permiso.guard';
import { AdjuntoTipo } from './schemas/adjunto-practica.schema';

import { AuditoriaService } from '../auditoria/auditoria.service';
import { AuditoriaEvento } from '../auditoria/auditoria.evento';

@Controller('adjuntos')
export class AdjuntosController {
  constructor(
    private readonly adjuntosService: AdjuntosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // ============================
  // SUBIR ADJUNTO (metadata)
  // ============================
  @UseGuards(StaffPermisoGuard, RolesGuard)
  @Roles(Role.Staff, Role.Medico)
  @Post()
  crear(@Body() dto: CreateAdjuntoDto) {
    return this.adjuntosService.crearAdjunto({
      ...dto,
      tipo: AdjuntoTipo.PDF,
    });
  }

  // ============================
  // VER ADJUNTOS DE UN TURNO
  // ============================
  @UseGuards(StaffPermisoGuard, RolesGuard)
@Roles(Role.Staff, Role.Medico, Role.Empresa)
@Get('turno/:turnoId')
async listar(@Param('turnoId') turnoId: string) {
  return await this.adjuntosService.listarPorTurno(turnoId);
}


  // ============================
  // 🔒 DESCARGA SEGURA PDF FINAL
  // ============================
  @UseGuards(StaffPermisoGuard, RolesGuard)
  @Roles(Role.Empresa, Role.Medico)
  @Get(':id/descargar')
  async descargar(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {

    if (!req.user) {
    throw new ForbiddenException('Usuario no autenticado');
  }

    const adjunto =
      await this.adjuntosService.obtenerAdjuntoParaDescarga(id);

    // 🧾 AUDITORÍA DE DESCARGA
   await this.auditoriaService.registrar({
    evento: AuditoriaEvento.DESCARGA_PDF,
    usuarioId: req.user['id'],
    rol: req.user['rol'],
    adjuntoId: id,
    turnoId: adjunto.turnoId.toString(),
  });

    return res.download(adjunto.path);
  }
}
