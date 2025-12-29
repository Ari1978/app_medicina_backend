import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { PerfilExamenService } from './perfil-examen.service';
import { CreatePerfilExamenDto } from './dto/create-perfil-examen.dto';
import { UpdatePerfilExamenDto } from './dto/update-perfil-examen.dto';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { JwtStaffGuard } from '../auth/guards/staff-jwt.guard';

@ApiTags('Perfil Examen')
@Controller('perfil-examen')
export class PerfilExamenController {
  constructor(private readonly service: PerfilExamenService) {}

  // =========================
  // STAFF → VER TODOS
  // =========================
  @ApiCookieAuth('asmel_staff_token')
  @UseGuards(JwtStaffGuard)
  @Get('staff')
  findAllStaff() {
    return this.service.findAllStaff();
  }

  // =========================
  // EMPRESA → VER SUS PERFILES
  // =========================
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get()
  listarEmpresa(@Req() req: Request) {
    const empresaId = (req.user as { empresaId: string }).empresaId;
    return this.service.findByEmpresa(empresaId);
  }

  // =========================
  // STAFF → VER PERFIL
  // =========================
  @ApiCookieAuth('asmel_staff_token')
  @UseGuards(JwtStaffGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  // =========================
  // STAFF → CREAR PERFIL
  // =========================
  @ApiCookieAuth('asmel_staff_token')
  @UseGuards(JwtStaffGuard)
  @Post()
  create(@Body() dto: CreatePerfilExamenDto) {
    return this.service.createForEmpresa(dto);
  }

  // =========================
  // STAFF → EDITAR PERFIL
  // =========================
  @ApiCookieAuth('asmel_staff_token')
  @UseGuards(JwtStaffGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePerfilExamenDto,
  ) {
    return this.service.update(id, dto);
  }

  // =========================
  // STAFF → ELIMINAR PERFIL (LÓGICO)
  // =========================
  @ApiCookieAuth('asmel_staff_token')
  @UseGuards(JwtStaffGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
