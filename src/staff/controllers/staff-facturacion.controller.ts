
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';
import { StaffPermisoGuard } from '../../auth/guards/staff-permiso.guard';
import { StaffPermiso } from '../../auth/decorators/staff-permiso.decorator';

@Controller('staff/facturacion')
@UseGuards(JwtStaffGuard, StaffPermisoGuard)
export class StaffFacturacionController {

  @Get('dashboard')
  @StaffPermiso('facturacion')
  dashboard() {
    return { message: 'Acceso a Facturación OK' };
  }
}
