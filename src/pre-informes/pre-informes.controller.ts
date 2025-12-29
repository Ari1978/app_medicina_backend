import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { PreInformesService } from './pre-informes.service';
import { CreatePreInformeDto } from './dto/create-pre-informe.dto';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StaffPermisoGuard } from '../auth/guards/staff-permiso.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { StaffPermiso } from '../auth/decorators/staff-permiso.decorator';

import { Role } from '../auth/roles.enum';
import { StaffPermisoEnum } from '../auth/enums/staff-permiso.enum';

@Controller('pre-informes')
export class PreInformesController {
  constructor(
    private readonly preInformesService: PreInformesService,
  ) {}

  // ============================================================
  // CREAR / EDITAR PRE-INFORME
  // ============================================================
  @UseGuards(JwtAuthGuard, RolesGuard, StaffPermisoGuard)
  @Roles(Role.Staff, Role.Medico)
  @StaffPermiso(StaffPermisoEnum.INFORMES)
  @Post()
  guardar(
    @Body() dto: CreatePreInformeDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    return this.preInformesService.guardarPreInforme({
      turnoId: dto.turnoId,
      textoPorPractica: dto.textoPorPractica,
      observacionGeneral: dto.observacionGeneral,
      usuarioId: user.id,
    });
  }

  // ============================================================
  // OBTENER PRE-INFORME POR TURNO
  // ============================================================
  @UseGuards(JwtAuthGuard, RolesGuard, StaffPermisoGuard)
  @Roles(Role.Staff, Role.Medico)
  @StaffPermiso(StaffPermisoEnum.INFORMES)
  @Get('turno/:turnoId')
  obtener(@Param('turnoId') turnoId: string) {
    return this.preInformesService.obtenerPorTurno(turnoId);
  }
}
