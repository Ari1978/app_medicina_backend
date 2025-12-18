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

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { StaffUserService } from './staff-user.service';
import { AdminGuard } from 'src/auth/guards/jwt-admin.guard';

@ApiTags('Admin - Staff')
@ApiBearerAuth()
@Controller('admin/staff')
@UseGuards(AdminGuard)
export class StaffUserController {
  constructor(private readonly staffUserService: StaffUserService) {}

  // ============================================================
  // ✔ CREAR STAFF
  // ============================================================
  @ApiOperation({ summary: 'Crear usuario staff' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'staff01' },
        password: { type: 'string', example: 'staff123' },
      },
      required: ['username', 'password'],
    },
  })
  @Post()
  async createStaff(
    @Body() body: { username: string; password: string },
  ) {
    return this.staffUserService.create(body.username, body.password);
  }

  // ============================================================
  // ✔ LISTAR STAFF
  // ============================================================
  @ApiOperation({ summary: 'Listar usuarios staff' })
  @Get()
  async listarStaff() {
    return this.staffUserService.getAll();
  }

  // ============================================================
  // ✔ ELIMINAR STAFF
  // ============================================================
  @ApiOperation({ summary: 'Eliminar usuario staff' })
  @ApiParam({
    name: 'id',
    example: '64f1b2c3a4...',
  })
  @Delete(':id')
  async eliminarStaff(@Param('id') id: string) {
    return this.staffUserService.delete(id);
  }

  // ============================================================
  // ✔ ASIGNAR PERMISOS
  // ============================================================
  @ApiOperation({ summary: 'Asignar permisos a staff' })
  @ApiParam({
    name: 'id',
    example: '64f1b2c3a4...',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permisos: {
          type: 'array',
          items: { type: 'string' },
          example: ['examenes', 'formularios'],
        },
      },
      required: ['permisos'],
    },
  })
  @Patch(':id/permisos')
  async asignarPermisos(
    @Param('id') id: string,
    @Body('permisos') permisos: string[],
  ) {
    return this.staffUserService.asignarPermisos(id, permisos);
  }

  // ============================================================
  // ✔ RESETEAR CONTRASEÑA
  // ============================================================
  @ApiOperation({ summary: 'Resetear contraseña de staff' })
  @ApiParam({
    name: 'id',
    example: '64f1b2c3a4...',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'NuevaPass123' },
      },
      required: ['password'],
    },
  })
  @Patch(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.staffUserService.resetPassword(id, password);
  }
}
