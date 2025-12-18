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

import { Response } from 'express';
import { StaffService } from './staff.service';
import { JwtStaffGuard } from '../auth/guards/staff-jwt.guard';
import { setStaffCookie, clearStaffCookie } from './staff.jwt';

import { TurnoService } from '../turno/turno.service';
import { UpdateEstudiosDto } from '../turno/dto/update-estudios.dto';

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
  @UseGuards(JwtStaffGuard)
  @Get('auth/me')
  me(@Req() req: any) {
    return {
      id: req.user.id,
      role: req.user.role,
      username: req.user.username,
      permisos: req.user.permisos,
    };
  }

  // ============================================================
  // LOGOUT
  // ============================================================
  @UseGuards(JwtStaffGuard)
  @Post('auth/logout')
  logout(@Res() res: Response) {
    clearStaffCookie(res);
    return res.json({ message: 'Logout staff OK' });
  }

  // ============================================================
  // EDITAR ESTUDIOS
  // ============================================================
  @UseGuards(JwtStaffGuard)
  @Patch('turnos/:id/estudios')
  async actualizarEstudios(
    @Param('id') id: string,
    @Body() dto: UpdateEstudiosDto,
  ) {
    return this.turnoService.actualizarEstudiosStaff(id, dto.listaEstudios);
  }

  // ============================================================
  // VER / EDITAR RESULTADOS (LISTADO CON FILTROS)
  // ============================================================
  @UseGuards(JwtStaffGuard)
  @Get('resultados')
  async buscarResultados(
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
}
