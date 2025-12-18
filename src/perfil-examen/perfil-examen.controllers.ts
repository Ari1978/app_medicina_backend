// src/perfil-examen/perfil-examen.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PerfilExamenService } from './perfil-examen.service';
import { CreatePerfilExamenDto } from './dto/create-perfil-examen.dto';
import { UpdatePerfilExamenDto } from './dto/update-perfil-examen.dto';

import { JwtStaffGuard } from '../auth/guards/staff-jwt.guard';
import { StaffPermisoGuard } from '../auth/guards/staff-permiso.guard';

@ApiTags('Perfil Examen')
@ApiBearerAuth()
@Controller('perfil-examen')
@UseGuards(JwtStaffGuard) // ✅ todas requieren staff autenticado
export class PerfilExamenController {
  constructor(private readonly perfilService: PerfilExamenService) {}

  // =============================
  //          CREAR PERFIL
  // =============================
  @Post()
  @UseGuards(StaffPermisoGuard)
  @ApiOperation({
    summary: 'Crear perfil de examen',
    description: 'Crea un perfil de examen asociado a un puesto y empresa',
  })
  @ApiBody({ type: CreatePerfilExamenDto })
  @ApiResponse({ status: 201, description: 'Perfil creado correctamente' })
  create(@Body() dto: CreatePerfilExamenDto) {
    return this.perfilService.create(dto);
  }

  // =============================
  //      LISTAR TODOS
  // =============================
  @Get()
  @ApiOperation({
    summary: 'Listar perfiles de examen',
    description: 'Obtiene todos los perfiles de examen del sistema',
  })
  @ApiResponse({ status: 200, description: 'Listado de perfiles' })
  findAll() {
    return this.perfilService.findAll();
  }

  // =============================
  //   LISTAR POR EMPRESA
  // =============================
  @Get('empresa/:empresaId')
  @ApiOperation({
    summary: 'Listar perfiles por empresa',
    description: 'Obtiene los perfiles de examen asociados a una empresa',
  })
  @ApiParam({
    name: 'empresaId',
    description: 'ID de la empresa',
    example: '64f123abc456def789012345',
  })
  @ApiResponse({ status: 200, description: 'Perfiles de la empresa' })
  getByEmpresa(@Param('empresaId') empresaId: string) {
    return this.perfilService.getByEmpresa(empresaId);
  }

  // =============================
  //   BUSCAR POR PUESTO
  // =============================
  @Get('puesto')
  @ApiOperation({
    summary: 'Buscar perfil por puesto',
    description: 'Busca un perfil de examen por empresa y puesto',
  })
  @ApiQuery({
    name: 'empresaId',
    required: true,
    description: 'ID de la empresa',
    example: '64f123abc456def789012345',
  })
  @ApiQuery({
    name: 'puesto',
    required: true,
    description: 'Nombre del puesto',
    example: 'Operario Metalúrgico',
  })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  getByPuesto(
    @Query('empresaId') empresaId: string,
    @Query('puesto') puesto: string,
  ) {
    return this.perfilService.getByPuesto(empresaId, puesto);
  }

  // =============================
  //     OBTENER 1 PERFIL
  // =============================
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener perfil por ID',
    description: 'Obtiene un perfil de examen específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del perfil',
    example: '64f999aaa111bbb222ccc333',
  })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  findOne(@Param('id') id: string) {
    return this.perfilService.findOne(id);
  }

  // =============================
  //       EDITAR PERFIL
  // =============================
  @Patch(':id')
  @UseGuards(StaffPermisoGuard)
  @ApiOperation({
    summary: 'Editar perfil de examen',
    description: 'Edita los datos de un perfil de examen existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del perfil',
    example: '64f999aaa111bbb222ccc333',
  })
  @ApiBody({ type: UpdatePerfilExamenDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente' })
  update(@Param('id') id: string, @Body() dto: UpdatePerfilExamenDto) {
    return this.perfilService.update(id, dto);
  }

  // =============================
  //    ELIMINAR PERFIL
  // =============================
  @Delete(':id')
  @UseGuards(StaffPermisoGuard)
  @ApiOperation({
    summary: 'Eliminar perfil de examen',
    description: 'Elimina (o desactiva) un perfil de examen',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del perfil',
    example: '64f999aaa111bbb222ccc333',
  })
  @ApiResponse({ status: 200, description: 'Perfil eliminado correctamente' })
  delete(@Param('id') id: string) {
    return this.perfilService.delete(id);
  }
}
