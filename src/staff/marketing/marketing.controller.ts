import {
  Controller,
  Get,
  Patch,
  Param,
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

@Controller('staff/marketing')
@UseGuards(JwtAuthGuard, RolesGuard, StaffPermisoGuard)
@Roles(Role.Staff)
@StaffPermiso(StaffPermisoEnum.MARKETING)
export class MarketingController {
  constructor(
    private readonly formulariosService: FormulariosService,
  ) {}

  // ----------------------------------
  // PRESUPUESTOS
  // ----------------------------------

  @Get('presupuestos')
  obtenerPresupuestos() {
    return this.formulariosService.listarPorTipo('presupuesto');
  }

  @Patch('presupuestos/:id/presupuestado')
  marcarComoPresupuestado(@Param('id') id: string) {
    return this.formulariosService.marcarPresupuestado(id);
  }
}
