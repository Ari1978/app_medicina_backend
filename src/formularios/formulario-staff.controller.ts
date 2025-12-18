// src/formularios/formulario-staff.controller.ts
import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { JwtStaffGuard } from '../auth/guards/staff-jwt.guard';
import { FormulariosService } from './formulario.service';

@ApiTags('Staff - Formularios')
@ApiBearerAuth()
@Controller('staff/formularios')
@UseGuards(JwtStaffGuard) // ✅ todas requieren staff autenticado
export class FormularioStaffController {
  constructor(private readonly service: FormulariosService) {}

  // --------------------------------------------
  // 📌 1) Listar formularios pendientes
  // --------------------------------------------
  @Get('pendientes')
  @ApiOperation({
    summary: 'Listar formularios pendientes',
    description: 'Obtiene todos los formularios pendientes de resolución',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de formularios pendientes',
  })
  listarPendientes() {
    return this.service.listarPendientes();
  }

  // --------------------------------------------
  // 📌 2) Obtener un formulario por ID
  // --------------------------------------------
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener formulario por ID',
    description: 'Obtiene el detalle completo de un formulario',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del formulario',
    example: '64fabc123456def789000111',
  })
  @ApiResponse({
    status: 200,
    description: 'Formulario encontrado',
  })
  obtenerUno(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  // --------------------------------------------
  // 📌 3) Responder un formulario
  // --------------------------------------------
  @Patch(':id/responder')
  @ApiOperation({
    summary: 'Responder formulario',
    description: 'Carga la respuesta del staff para un formulario',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del formulario',
    example: '64fabc123456def789000111',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        respuesta: {
          type: 'string',
          example: 'Formulario analizado, se sugiere continuar con evaluación',
        },
      },
      required: ['respuesta'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Formulario respondido correctamente',
  })
  responder(@Param('id') id: string, @Body('respuesta') rsp: string) {
    return this.service.responder(id, rsp);
  }

  // --------------------------------------------
  // 📌 4) Marcar un formulario como RESUELTO
  // --------------------------------------------
  @Patch(':id/resolver')
  @ApiOperation({
    summary: 'Resolver formulario',
    description: 'Marca un formulario como resuelto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del formulario',
    example: '64fabc123456def789000111',
  })
  @ApiResponse({
    status: 200,
    description: 'Formulario marcado como resuelto',
  })
  resolver(@Param('id') id: string) {
    return this.service.resolver(id);
  }
}
