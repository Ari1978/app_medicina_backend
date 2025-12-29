import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';

import { FormulariosService } from '../../formularios/formulario.service';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { StaffPermisoGuard } from '../../auth/guards/staff-permiso.guard';

import { Roles } from '../../auth/decorators/roles.decorator';
import { StaffPermiso } from '../../auth/decorators/staff-permiso.decorator';

import { Role } from '../../auth/roles.enum';
import { StaffPermisoEnum } from '../../auth/enums/staff-permiso.enum';

@Controller('staff/formularios')
@UseGuards(JwtAuthGuard, RolesGuard, StaffPermisoGuard)
@Roles(Role.Staff)
@StaffPermiso(StaffPermisoEnum.FORMULARIOS)
export class FormularioStaffController {
  constructor(private readonly service: FormulariosService) {}

  // ----------------------------------------------------
  // 📌 1) Listar formularios pendientes
  // ----------------------------------------------------
  @Get('pendientes')
  listarPendientes() {
    return this.service.listarPendientes();
  }

  // ----------------------------------------------------
  // 📌 2) Obtener formulario por ID
  // ----------------------------------------------------
  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  // ----------------------------------------------------
  // 📌 3) Responder formulario (pendiente → en_progreso)
  // ----------------------------------------------------
  @Patch(':id/responder')
  responder(
    @Param('id') id: string,
    @Body('respuesta') respuesta: string,
  ) {
    return this.service.responder(id, respuesta);
  }

  // ----------------------------------------------------
  // 📌 4) Resolver formulario (en_progreso → resuelto)
  // ----------------------------------------------------
  @Patch(':id/resolver')
  resolver(@Param('id') id: string) {
    return this.service.resolver(id);
  }
}
