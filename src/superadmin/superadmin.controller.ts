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

import { SuperAdminService } from './superadmin.service';
import {
  setSuperAdminCookie,
  clearSuperAdminCookie,
} from './superadmin.jwt';
import { JwtSuperAdminGuard } from '../auth/guards/jwt-superadmin.guard';

@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  // ============================================================
  // LOGIN & LOGOUT
  // ============================================================
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

  @Post('logout')
  logout(@Res() res: Response) {
    clearSuperAdminCookie(res);
    return res.json({ message: 'Logout OK' });
  }

  // ============================================================
  // ME
  // ============================================================
  @UseGuards(JwtSuperAdminGuard)
  @Get('me')
  me() {
    return { message: 'SuperAdmin autenticado', role: 'superadmin' };
  }

  // ============================================================
  // ADMIN CRUD
  // ============================================================
  @UseGuards(JwtSuperAdminGuard)
  @Post('admins')
  crearAdmin(@Body() body) {
    return this.service.crearAdmin(body.username, body.password);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Get('admins')
  listarAdmins() {
    return this.service.listarAdmins();
  }

  @UseGuards(JwtSuperAdminGuard)
  @Patch('admins/:id')
  editarAdmin(@Param('id') id: string, @Body() body) {
    return this.service.editarAdmin(id, body);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Patch('admins/:id/reset-password')
  resetPasswordAdmin(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.service.resetAdminPassword(id, password);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Delete('admins/:id')
  eliminarAdmin(@Param('id') id: string) {
    return this.service.eliminarAdmin(id);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Patch('admins/permisos/:id')
  permisosAdmin(@Param('id') id: string, @Body('permisos') permisos) {
    return this.service.permisosAdmin(id, permisos);
  }

  // ============================================================
  // STAFF CRUD
  // ============================================================
  @UseGuards(JwtSuperAdminGuard)
  @Post('staff')
  crearStaff(@Body() body) {
    return this.service.crearStaff(body.username, body.password);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Get('staff')
  listarStaff() {
    return this.service.listarStaff();
  }

  @UseGuards(JwtSuperAdminGuard)
  @Patch('staff/:id')
  editarStaff(@Param('id') id: string, @Body() body) {
    return this.service.editarStaff(id, body);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Patch('staff/:id/reset-password')
  resetPasswordStaff(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.service.resetStaffPassword(id, password);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Delete('staff/:id')
  eliminarStaff(@Param('id') id: string) {
    return this.service.eliminarStaff(id);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Patch('staff/permisos/:id')
  permisosStaff(@Param('id') id: string, @Body('permisos') permisos) {
    return this.service.permisosStaff(id, permisos);
  }

  // ============================================================
  // EMPRESAS PRECARGADAS
  // ============================================================
  @UseGuards(JwtSuperAdminGuard)
  @Post('empresas-precargadas')
  crearEmpresaPrecargada(@Body() body) {
    return this.service.crearEmpresaPrecargada(body);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Get('empresas-precargadas')
  listarEmpresasPrecargadas() {
    return this.service.listarEmpresasPrecargadas();
  }

  // ============================================================
  // EMPRESAS FINALES
  // ============================================================
  @UseGuards(JwtSuperAdminGuard)
  @Get('empresas-finales')
  listarEmpresasFinales() {
    return this.service.listarEmpresasFinales();
  }

  @UseGuards(JwtSuperAdminGuard)
  @Patch('empresas-finales/:id')
  editarEmpresaFinal(@Param('id') id: string, @Body() body) {
    return this.service.editarEmpresaFinal(id, body);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Patch('empresas-finales/:id/reset-password')
  resetPasswordEmpresaFinal(
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.service.resetPasswordEmpresaFinal(id, password);
  }

  @UseGuards(JwtSuperAdminGuard)
  @Delete('empresas-finales/:id')
  eliminarEmpresaFinal(@Param('id') id: string) {
    return this.service.eliminarEmpresaFinal(id);
  }

  // ============================================================
  // ✅ IMPORTAR EMPRESAS POR EXCEL
  // ============================================================
  @UseGuards(JwtSuperAdminGuard)
  @Post('empresas/import')
  @UseInterceptors(FileInterceptor('file'))
  importarEmpresas(@UploadedFile() file: Express.Multer.File) {
    return this.service.importarEmpresas(file);
  }

  @UseGuards(JwtSuperAdminGuard)
@Get('stats')
getStats() {
  return this.service.getStats();
}

// ============================================================
// ✅ PERFILES DE EXAMEN POR EMPRESA (SUPERADMIN)
// ============================================================

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

@UseGuards(JwtSuperAdminGuard)
@Get('empresas/:empresaId/perfiles')
listarPerfilesEmpresa(@Param('empresaId') empresaId: string) {
  return this.service.listarPerfilesEmpresa(empresaId);
}

@UseGuards(JwtSuperAdminGuard)
@Patch('perfiles/:id')
editarPerfil(@Param('id') id: string, @Body() body) {
  return this.service.editarPerfilExamen(id, body);
}

@UseGuards(JwtSuperAdminGuard)
@Delete('perfiles/:id')
eliminarPerfil(@Param('id') id: string) {
  return this.service.eliminarPerfilExamen(id);
}


}
