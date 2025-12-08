
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';
import { StaffPermisoGuard } from '../../auth/guards/staff-permiso.guard';
import { StaffPermiso } from '../../auth/decorators/staff-permiso.decorator';

@Controller('staff/marketing')
@UseGuards(JwtStaffGuard, StaffPermisoGuard)
export class StaffMarketingController {

  @Get('dashboard')
  @StaffPermiso('marketing')
  dashboard() {
    return { message: 'Acceso a Marketing OK' };
  }
}
