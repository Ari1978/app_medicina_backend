import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  Param,
  Patch,
  Query,
} from '@nestjs/common';

import { Response, Request } from 'express';

import { StaffService } from './staff.service';
import { TurnoService } from '../turno/turno.service';

import { setStaffCookie, clearStaffCookie } from './staff.jwt';

import { UpdatePracticasDto } from '../turno/dto/update-practicas.dto';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtStaffGuard } from '../auth/guards/staff-jwt.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { StaffPermiso } from '../auth/decorators/staff-permiso.decorator';

import { Role } from '../auth/roles.enum';
import { StaffPermisoEnum } from '../auth/enums/staff-permiso.enum';
import { StaffPermisoGuard } from '../auth/guards/staff-permiso.guard';




@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly turnoService: TurnoService,
  ) {}

  // ============================================================
  // LOGIN STAFF
  // ============================================================
  @Post('auth/login')
  async loginStaff(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const data = await this.staffService.login(body.username, body.password);

    setStaffCookie(res, data.token);

    return res.json({
      message: 'Login staff OK',
      staff: data.staff,
    });
  }

  // ============================================================
  // STAFF ME
  // ============================================================
  @UseGuards(JwtStaffGuard, RolesGuard)
  @Roles(Role.Staff)
  @Get('auth/me')
  me(@Req() req: Request) {
    const user = req.user as any;

    return {
      id: user.id,
      role: user.role,
      username: user.username,
      permisos: user.permisos ?? [],
    };
  }

  // ============================================================
  // LOGOUT
  // ============================================================
  @UseGuards(JwtStaffGuard, RolesGuard)
  @Roles(Role.Staff)
  @Post('auth/logout')
  logout(@Res() res: Response) {
    clearStaffCookie(res);
    return res.json({ message: 'Logout staff OK' });
  }

  // ============================================================
  // EDITAR PRÁCTICAS DEL TURNO
  // Permiso: TURNOS
  // ============================================================
  @UseGuards(JwtStaffGuard, RolesGuard, StaffPermisoGuard)
  @Roles(Role.Staff)
  @StaffPermiso(StaffPermisoEnum.TURNOS)
  @Patch('turnos/:id/practicas')
  actualizarEstudios(
    @Param('id') id: string,
    @Body() dto: UpdatePracticasDto,
  ) {
    return this.turnoService.actualizarPracticasStaff(
      id,
      dto.listaPracticas,
    );
  }

  // ============================================================
  // BUSCAR RESULTADOS
  // Permiso: INFORMES
  // ============================================================
  @UseGuards(JwtStaffGuard, RolesGuard, StaffPermisoGuard)
  @Roles(Role.Staff)
  @StaffPermiso(StaffPermisoEnum.INFORMES)
  @Get('resultados')
  buscarResultados(
    @Query('empresa') empresa?: string,
    @Query('dni') dni?: string,
    @Query('nombre') nombre?: string,
  ) {
    return this.staffService.buscarResultados({
      empresa,
      dni,
      nombre,
    });
  }

  // ============================================================
  // VER DETALLE DE TURNO
  // Permiso: TURNOS
  // ============================================================
  @UseGuards(JwtStaffGuard, RolesGuard, StaffPermisoGuard)
  @Roles(Role.Staff)
  @StaffPermiso(StaffPermisoEnum.TURNOS)
  @Get('turnos/:id')
  verTurnoStaff(@Param('id') id: string) {
    return this.turnoService.obtenerTurnoStaff(id);
  }

  // ============================================================
  // TURNOS POR FECHA
  // Permiso: EXAMENES
  // ============================================================
  @UseGuards(JwtStaffGuard, RolesGuard, StaffPermisoGuard)
  @Roles(Role.Staff)
  @StaffPermiso(StaffPermisoEnum.EXAMENES)
  @Get('examenes/por-fecha/:fecha')
  turnosPorFechaStaff(@Param('fecha') fecha: string) {
    return this.turnoService.listarPorFechaStaff(fecha);
  }
}
