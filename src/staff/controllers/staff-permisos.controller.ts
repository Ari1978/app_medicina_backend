
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';

@Controller('staff/permisos')
export class StaffPermisosController {
  @UseGuards(JwtStaffGuard)
  @Get()
  getPermisos(@Req() req) {
    return {
      id: req.user.id,
      username: req.user.username,
      permisos: req.user.permisos ?? [],
    };
  }
}
