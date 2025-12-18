// src/formularios/formulario-empresa.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { FormulariosService } from './formulario.service';

import { CreateVisitaDto } from './dto/create-visita.dto';
import { CreateAutorizacionDto } from './dto/create-autorizacion.dto';
import { CreateAsesoramientoDto } from './dto/create-asesoramiento.dto';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { CreateTurnoEspecialDto } from './dto/create-turno-especial.dto';

@ApiTags('Empresa - Formularios')
@ApiBearerAuth()
@Controller('empresa/formularios')
@UseGuards(JwtEmpresaGuard) // ✅ todas requieren empresa autenticada
export class FormularioEmpresaController {
  constructor(private readonly service: FormulariosService) {}

  // =============================
  //            VISITA
  // =============================
  @Post('visita')
  @ApiOperation({
    summary: 'Crear formulario de visita',
    description: 'Registra una solicitud de visita para un empleado',
  })
  @ApiBody({ type: CreateVisitaDto })
  @ApiResponse({ status: 201, description: 'Formulario de visita creado' })
  crearVisita(@Req() req, @Body() dto: CreateVisitaDto) {
    return this.service.crear(req.user.id, 'visita', dto);
  }

  // =============================
  //        ASESORAMIENTO
  // =============================
  @Post('asesoramiento')
  @ApiOperation({
    summary: 'Crear formulario de asesoramiento',
    description: 'Registra una solicitud de asesoramiento laboral',
  })
  @ApiBody({ type: CreateAsesoramientoDto })
  @ApiResponse({
    status: 201,
    description: 'Formulario de asesoramiento creado',
  })
  crearAsesoramiento(@Req() req, @Body() dto: CreateAsesoramientoDto) {
    return this.service.crear(req.user.id, 'asesoramiento', dto);
  }

  // =============================
  //        AUTORIZACIÓN
  // =============================
  @Post('autorizacion')
  @ApiOperation({
    summary: 'Crear formulario de autorización',
    description: 'Registra una autorización médica/laboral',
  })
  @ApiBody({ type: CreateAutorizacionDto })
  @ApiResponse({
    status: 201,
    description: 'Formulario de autorización creado',
  })
  crearAutorizacion(@Req() req, @Body() dto: CreateAutorizacionDto) {
    return this.service.crear(req.user.id, 'autorizacion', dto);
  }

  // =============================
  //        PRESUPUESTO
  // =============================
  @Post('presupuesto')
  @ApiOperation({
    summary: 'Crear formulario de presupuesto',
    description: 'Registra una solicitud de presupuesto',
  })
  @ApiBody({ type: CreatePresupuestoDto })
  @ApiResponse({
    status: 201,
    description: 'Formulario de presupuesto creado',
  })
  crearPresupuesto(@Req() req, @Body() dto: CreatePresupuestoDto) {
    return this.service.crear(req.user.id, 'presupuesto', dto);
  }

  // =============================
  //      TURNO ESPECIAL
  // =============================
  @Post('turno-especial')
  @ApiOperation({
    summary: 'Crear formulario de turno especial',
    description: 'Registra una solicitud de turno especial',
  })
  @ApiBody({ type: CreateTurnoEspecialDto })
  @ApiResponse({
    status: 201,
    description: 'Formulario de turno especial creado',
  })
  crearTurnoEspecial(@Req() req, @Body() dto: CreateTurnoEspecialDto) {
    return this.service.crear(req.user.id, 'turno-especial', dto);
  }
}
