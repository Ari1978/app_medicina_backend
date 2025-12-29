import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { StaffPermisoGuard } from '../../auth/guards/staff-permiso.guard';

import { Roles } from '../../auth/decorators/roles.decorator';
import { StaffPermiso } from '../../auth/decorators/staff-permiso.decorator';

import { Role } from '../../auth/roles.enum';
import { StaffPermisoEnum } from '../../auth/enums/staff-permiso.enum';

@Controller('staff/facturacion')
@UseGuards(JwtAuthGuard, RolesGuard, StaffPermisoGuard)
@Roles(Role.Staff)
@StaffPermiso(StaffPermisoEnum.FACTURACION)
export class StaffFacturacionController {

  @Get('dashboard')
  dashboard() {
    return { message: 'Acceso a Facturación OK' };
  }
}
