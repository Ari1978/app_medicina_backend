// src/admin/admin.controller.ts
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Request, Response } from 'express';

import { AdminService } from './admin.service';
import { StaffUserService } from '../staff-user/staff-user.service';
import { EmpresaPrecargadaService } from '../empresa/empresaPrecargada.service';

import { AdminGuard } from '../auth/guards/jwt-admin.guard';
import { setAdminCookie, clearAdminCookie } from './admin.jwt';

@ApiTags('Admin')
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
  @ApiOperation({
    summary: 'Login admin',
    description: 'Autenticación de administrador y seteo de cookie JWT',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'admin' },
        password: { type: 'string', example: 'admin123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener admin logueado',
    description: 'Devuelve los datos del administrador autenticado',
  })
  @ApiResponse({ status: 200, description: 'Admin autenticado' })
  async me(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.adminService.me(user.id);
  }

  // ============================================================
  // 🚪 LOGOUT
  // ============================================================
  @Post('logout')
  @ApiOperation({
    summary: 'Logout admin',
    description: 'Elimina la cookie de sesión del administrador',
  })
  @ApiResponse({ status: 200, description: 'Logout OK' })
  async logout(@Res() res: Response) {
    clearAdminCookie(res);
    return res.json({ message: 'Logout OK' });
  }

  // ============================================================
  // 👥 STAFF — CREAR
  // ============================================================
  @UseGuards(AdminGuard)
  @Post('create-staff')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear usuario staff',
    description: 'Crea un nuevo usuario staff',
  })
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
  @ApiResponse({ status: 201, description: 'Staff creado correctamente' })
  async createStaff(@Body() body: { username: string; password: string }) {
    return this.staffUserService.create(body.username, body.password);
  }

  // ============================================================
  // 👥 STAFF — LISTAR
  // ============================================================
  @UseGuards(AdminGuard)
  @Get('staff')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar staff',
    description: 'Obtiene el listado completo de usuarios staff',
  })
  @ApiResponse({ status: 200, description: 'Listado de staff' })
  async listarStaff() {
    return this.staffUserService.getAll();
  }

  // ============================================================
  // 👥 STAFF — ELIMINAR
  // ============================================================
  @UseGuards(AdminGuard)
  @Delete('staff/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar staff',
    description: 'Elimina un usuario staff',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del staff',
    example: '64fabc123456def789000111',
  })
  @ApiResponse({ status: 200, description: 'Staff eliminado correctamente' })
  async eliminarStaff(@Param('id') id: string) {
    return this.staffUserService.delete(id);
  }

  // ============================================================
  // 👥 STAFF — ASIGNAR PERMISOS
  // ============================================================
  @UseGuards(AdminGuard)
  @Patch('staff/permisos/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Asignar permisos a staff',
    description: 'Asigna permisos a un usuario staff',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del staff',
    example: '64fabc123456def789000111',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permisos: {
          type: 'array',
          items: { type: 'string' },
          example: ['formularios', 'turnos', 'sedes'],
        },
      },
      required: ['permisos'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos asignados correctamente',
  })
  async asignarPermisosAStaff(
    @Param('id') id: string,
    @Body('permisos') permisos: string[],
  ) {
    return this.staffUserService.asignarPermisos(id, permisos);
  }
}
