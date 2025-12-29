import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/roles.enum';

@Controller('staff/permisos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Staff)
export class StaffPermisosController {
  @Get()
  getPermisos(@Req() req: Request) {
    const user = req.user as any;

    return {
      id: user.id,
      username: user.username,
      permisos: user.permisos ?? [],
    };
  }
}
