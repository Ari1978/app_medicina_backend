import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

import { SuperAdminService } from './superadmin.service';
import {
  setSuperAdminCookie,
  clearSuperAdminCookie,
} from './superadmin.jwt';
import { JwtSuperAdminGuard } from '../auth/guards/jwt-superadmin.guard';

@ApiTags('SuperAdmin')
@ApiBearerAuth()
@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  // ============================================================
  // LOGIN & LOGOUT
  // ============================================================
  @ApiOperation({ summary: 'Login SuperAdmin' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'superadmin' },
        password: { type: 'string', example: 'superadmin123' },
      },
      required: ['username', 'password'],
    },
  })
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const { superAdmin, token } = await this.service.login(
      body.username,
      body.password,
    );

    setSuperAdminCookie(res, token);
    return res.json({ superAdmin });
  }

  @ApiOperation({ summary: 'Logout SuperAdmin' })
  @Post('logout')
  logout(@Res() res: Response) {
    clearSuperAdminCookie(res);
    return res.json({ message: 'Logout OK' });
  }

  // ============================================================
  // ME
  // ============================================================
  @ApiOperation({ summary: 'Perfil SuperAdmin autenticado' })
  @UseGuards(JwtSuperAdminGuard)
  @Get('me')
  me() {
    return { message: 'SuperAdmin autenticado', role: 'superadmin' };
  }

  // ============================================================
  // ADMIN CRUD
  // ============================================================
  @ApiOperation({ summary: 'Crear admin' })
  @UseGuards(JwtSuperAdminGuard)
  @Post('admins')
  crearAdmin(@Body() body) {
    return this.service.crearAdmin(body.username, body.password);
  }

  @ApiOperation({ summary: 'Listar admins' })
  @UseGuards(JwtSuperAdminGuard)
  @Get('admins')
  listarAdmins() {
    return this.service.listarAdmins();
  }

  @ApiOperation({ summary: 'Editar admin' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('admins/:id')
  editarAdmin(@Param('id') id: string, @Body() body) {
    return this.service.editarAdmin(id, body);
  }

  @ApiOperation({ summary: 'Reset password admin' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('admins/:id/reset-password')
  resetPasswordAdmin(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.service.resetAdminPassword(id, password);
  }

  @ApiOperation({ summary: 'Eliminar admin' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Delete('admins/:id')
  eliminarAdmin(@Param('id') id: string) {
    return this.service.eliminarAdmin(id);
  }

  @ApiOperation({ summary: 'Asignar permisos a admin' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('admins/permisos/:id')
  permisosAdmin(@Param('id') id: string, @Body('permisos') permisos) {
    return this.service.permisosAdmin(id, permisos);
  }

  // ============================================================
  // STAFF CRUD
  // ============================================================
  @ApiOperation({ summary: 'Crear staff' })
  @UseGuards(JwtSuperAdminGuard)
  @Post('staff')
  crearStaff(@Body() body) {
    return this.service.crearStaff(body.username, body.password);
  }

  @ApiOperation({ summary: 'Listar staff' })
  @UseGuards(JwtSuperAdminGuard)
  @Get('staff')
  listarStaff() {
    return this.service.listarStaff();
  }

  @ApiOperation({ summary: 'Editar staff' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('staff/:id')
  editarStaff(@Param('id') id: string, @Body() body) {
    return this.service.editarStaff(id, body);
  }

  @ApiOperation({ summary: 'Reset password staff' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('staff/:id/reset-password')
  resetPasswordStaff(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.service.resetStaffPassword(id, password);
  }

  @ApiOperation({ summary: 'Eliminar staff' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Delete('staff/:id')
  eliminarStaff(@Param('id') id: string) {
    return this.service.eliminarStaff(id);
  }

  @ApiOperation({ summary: 'Asignar permisos a staff' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('staff/permisos/:id')
  permisosStaff(@Param('id') id: string, @Body('permisos') permisos) {
    return this.service.permisosStaff(id, permisos);
  }

  // ============================================================
  // EMPRESAS PRECARGADAS / FINALES
  // ============================================================
  @ApiOperation({ summary: 'Crear empresa precargada' })
  @UseGuards(JwtSuperAdminGuard)
  @Post('empresas-precargadas')
  crearEmpresaPrecargada(@Body() body) {
    return this.service.crearEmpresaPrecargada(body);
  }

  @ApiOperation({ summary: 'Listar empresas precargadas' })
  @UseGuards(JwtSuperAdminGuard)
  @Get('empresas-precargadas')
  listarEmpresasPrecargadas() {
    return this.service.listarEmpresasPrecargadas();
  }

  @ApiOperation({ summary: 'Listar empresas finales' })
  @UseGuards(JwtSuperAdminGuard)
  @Get('empresas-finales')
  listarEmpresasFinales() {
    return this.service.listarEmpresasFinales();
  }

  @ApiOperation({ summary: 'Editar empresa final' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('empresas-finales/:id')
  editarEmpresaFinal(@Param('id') id: string, @Body() body) {
    return this.service.editarEmpresaFinal(id, body);
  }

  @ApiOperation({ summary: 'Reset password empresa final' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('empresas-finales/:id/reset-password')
  resetPasswordEmpresaFinal(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.service.resetPasswordEmpresaFinal(id, password);
  }

  @ApiOperation({ summary: 'Eliminar empresa final' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Delete('empresas-finales/:id')
  eliminarEmpresaFinal(@Param('id') id: string) {
    return this.service.eliminarEmpresaFinal(id);
  }

  // ============================================================
  // IMPORT EXCEL + STATS
  // ============================================================
  @ApiOperation({ summary: 'Importar empresas desde Excel' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtSuperAdminGuard)
  @Post('empresas/import')
  @UseInterceptors(FileInterceptor('file'))
  importarEmpresas(@UploadedFile() file: Express.Multer.File) {
    return this.service.importarEmpresas(file);
  }

  @ApiOperation({ summary: 'Estadísticas generales' })
  @UseGuards(JwtSuperAdminGuard)
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  // ============================================================
  // PERFILES DE EXAMEN
  // ============================================================
  @ApiOperation({ summary: 'Crear perfil de examen por empresa' })
  @ApiParam({ name: 'empresaId', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Post('empresas/:empresaId/perfiles')
  crearPerfilEmpresa(
    @Param('empresaId') empresaId: string,
    @Body() body: { puesto: string; estudios: { nombre: string; sector: string }[] },
  ) {
    return this.service.crearPerfilExamen({
      empresaId,
      puesto: body.puesto,
      estudios: body.estudios,
    });
  }

  @ApiOperation({ summary: 'Listar perfiles de examen por empresa' })
  @ApiParam({ name: 'empresaId', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Get('empresas/:empresaId/perfiles')
  listarPerfilesEmpresa(@Param('empresaId') empresaId: string) {
    return this.service.listarPerfilesEmpresa(empresaId);
  }

  @ApiOperation({ summary: 'Editar perfil de examen' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Patch('perfiles/:id')
  editarPerfil(@Param('id') id: string, @Body() body) {
    return this.service.editarPerfilExamen(id, body);
  }

  @ApiOperation({ summary: 'Eliminar perfil de examen' })
  @ApiParam({ name: 'id', example: '64f1b2c3a4...' })
  @UseGuards(JwtSuperAdminGuard)
  @Delete('perfiles/:id')
  eliminarPerfil(@Param('id') id: string) {
    return this.service.eliminarPerfilExamen(id);
  }

  
}
