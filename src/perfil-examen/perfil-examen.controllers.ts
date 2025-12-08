import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { PerfilExamenService } from './perfil-examen.service';
import { CreatePerfilExamenDto } from './dto/create-perfil-examen.dto';
import { UpdatePerfilExamenDto } from './dto/update-perfil-examen.dto';

@Controller('perfil-examen')
export class PerfilExamenController {
  constructor(private readonly perfilService: PerfilExamenService) {}

  // ✅ CREAR PERFIL PARA UNA EMPRESA
  @Post()
  create(@Body() dto: CreatePerfilExamenDto) {
    return this.perfilService.create(dto);
  }

  // ✅ LISTAR TODOS (solo para debug o superadmin)
  @Get()
  findAll() {
    return this.perfilService.findAll();
  }

  // ✅ LISTAR PERFILES POR EMPRESA
  @Get('empresa/:empresaId')
  getByEmpresa(@Param('empresaId') empresaId: string) {
    return this.perfilService.getByEmpresa(empresaId);
  }

  // ✅ BUSCAR PERFIL POR PUESTO (DENTRO DE UNA EMPRESA)
  @Get('puesto')
  getByPuesto(
    @Query('empresaId') empresaId: string,
    @Query('puesto') puesto: string,
  ) {
    return this.perfilService.getByPuesto(empresaId, puesto);
  }

  // ✅ OBTENER UN PERFIL POR ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilService.findOne(id);
  }

  // ✅ EDITAR PERFIL
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePerfilExamenDto) {
    return this.perfilService.update(id, dto);
  }

  // ✅ ELIMINAR PERFIL
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.perfilService.delete(id);
  }
}
