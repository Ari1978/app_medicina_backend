
import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { StaffUserService } from './staff-user.service';
import { AdminGuard } from 'src/auth/guards/jwt-admin.guard';

@Controller('admin/staff')
@UseGuards(AdminGuard)
export class StaffUserController {
  constructor(private readonly staffUserService: StaffUserService) {}

  // ============================================================
  // ✔ CREAR STAFF
  // ============================================================
  @Post()
  async createStaff(
    @Body() body: { username: string; password: string }
  ) {
    return this.staffUserService.create(body.username, body.password);
  }

  // ============================================================
  // ✔ LISTAR STAFF
  // ============================================================
  @Get()
  async listarStaff() {
    return this.staffUserService.getAll();
  }

  // ============================================================
  // ✔ ELIMINAR STAFF
  // ============================================================
  @Delete(':id')
  async eliminarStaff(@Param('id') id: string) {
    return this.staffUserService.delete(id);
  }

  // ============================================================
  // ✔ ASIGNAR PERMISOS
  // ============================================================
  @Patch(':id/permisos')
  async asignarPermisos(
    @Param('id') id: string,
    @Body('permisos') permisos: string[],
  ) {
    return this.staffUserService.asignarPermisos(id, permisos);
  }

  // ============================================================
  // ✔ RESETEAR CONTRASEÑA (OPCIONAL pero RECOMENDADO)
  // ============================================================
  @Patch(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.staffUserService.resetPassword(id, password);
  }
}
