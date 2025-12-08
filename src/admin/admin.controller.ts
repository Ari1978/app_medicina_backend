import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { AdminService } from './admin.service';
import { StaffUserService } from '../staff-user/staff-user.service';
import { EmpresaPrecargadaService } from '../empresa/empresaPrecargada.service';

import { AdminGuard } from '../auth/guards/jwt-admin.guard';
import { setAdminCookie, clearAdminCookie } from './admin.jwt';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly staffUserService: StaffUserService,
    private readonly empresaPrecargadaService: EmpresaPrecargadaService,
  ) {}

  // ============================================================
  // 🔐 LOGIN ADMIN
  // ============================================================
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const { admin, token } = await this.adminService.validateLogin(
        body.username,
        body.password,
      );

      setAdminCookie(res, token);

      return res.json({
        message: 'Login exitoso',
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
      });

    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      return res.status(401).json({ message });
    }
  }

  // ============================================================
  // ✔ ME
  // ============================================================
  @UseGuards(AdminGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.adminService.me(user.id);
  }

  // ============================================================
  // 🚪 LOGOUT
  // ============================================================
  @Post('logout')
  async logout(@Res() res: Response) {
    clearAdminCookie(res);
    return res.json({ message: 'Logout OK' });
  }

  // ============================================================
  // 👥 STAFF — CREAR
  // ============================================================
  @UseGuards(AdminGuard)
  @Post('create-staff')
  async createStaff(@Body() body: { username: string; password: string }) {
    return this.staffUserService.create(body.username, body.password);
  }

  // ============================================================
  // 👥 STAFF — LISTAR
  // ============================================================
  @UseGuards(AdminGuard)
  @Get('staff')
  async listarStaff() {
    return this.staffUserService.getAll();
  }

  // ============================================================
  // 👥 STAFF — ELIMINAR
  // ============================================================
  @UseGuards(AdminGuard)
  @Delete('staff/:id')
  async eliminarStaff(@Param('id') id: string) {
    return this.staffUserService.delete(id);
  }

  // ============================================================
  // 👥 STAFF — ASIGNAR PERMISOS
  // ============================================================
  @UseGuards(AdminGuard)
  @Patch('staff/permisos/:id')
  async asignarPermisosAStaff(
    @Param('id') id: string,
    @Body('permisos') permisos: string[],
  ) {
    return this.staffUserService.asignarPermisos(id, permisos);
  }
}
