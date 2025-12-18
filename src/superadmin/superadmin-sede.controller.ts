// src/sede/controllers/superadmin-sede.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { SedeService } from '../sedes/sede.service';
import { CreateSedeDto } from '../sedes/dto/create-sede.dto';
import { UpdateSedeDto } from '../sedes/dto/update-sede.dto';

@ApiTags('SuperAdmin - Sedes')
@Controller('superadmin/sedes')
export class SuperadminSedeController {
  constructor(private readonly service: SedeService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear sede',
    description: 'Crea una nueva sede del sistema',
  })
  @ApiBody({ type: CreateSedeDto })
  @ApiResponse({
    status: 201,
    description: 'Sede creada correctamente',
  })
  crear(@Body() dto: CreateSedeDto) {
    return this.service.crear(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar sedes',
    description: 'Obtiene el listado completo de sedes',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de sedes',
  })
  listar() {
    return this.service.listar();
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Editar sede',
    description: 'Edita los datos de una sede existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sede',
    example: '64f123abc456def789012345',
  })
  @ApiBody({ type: UpdateSedeDto })
  @ApiResponse({
    status: 200,
    description: 'Sede actualizada correctamente',
  })
  editar(@Param('id') id: string, @Body() dto: UpdateSedeDto) {
    return this.service.editar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar sede',
    description: 'Elimina una sede del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sede',
    example: '64f123abc456def789012345',
  })
  @ApiResponse({
    status: 200,
    description: 'Sede eliminada correctamente',
  })
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }
}
