import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { PacientesService } from './pacientes.service';

import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { StaffPermisoGuard } from '../../auth/guards/staff-permiso.guard';

import { Roles } from '../../auth/decorators/roles.decorator';
import { StaffPermiso } from '../../auth/decorators/staff-permiso.decorator';

import { Role } from '../../auth/roles.enum';
import { StaffPermisoEnum } from '../../auth/enums/staff-permiso.enum';

@Controller('staff/pacientes')
@UseGuards(JwtStaffGuard, RolesGuard, StaffPermisoGuard)
@Roles(Role.Staff)
@StaffPermiso(StaffPermisoEnum.RECEPCION)
export class PacientesController {
  constructor(
    private readonly pacientesService: PacientesService,
  ) {}

  // =========================
  // EDITAR PACIENTE / EMPLEADO
  // =========================
  @Patch(':id')
  editarPaciente(
    @Param('id') id: string,
    @Body()
    body: {
      apellido?: string;
      nombre?: string;
      dni?: string;
      puesto?: string;
      telefono?: string;
      direccion?: string;
      localidad?: string;
      provincia?: string;
      otros?: string;
    },
  ) {
    return this.pacientesService.editarPaciente(id, body);
  }
}
