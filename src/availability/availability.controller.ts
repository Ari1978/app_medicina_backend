import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';

import { AvailabilityService } from './availability.service';
import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { Request } from 'express';

@ApiTags('Empresa - Disponibilidad')
@Controller('empresa/disponibilidad')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // ===============================
  // DISPONIBILIDAD POR FECHA
  // ===============================
  @ApiOperation({
    summary: 'Obtener disponibilidad por fecha',
    description:
      'Devuelve la disponibilidad global de turnos para una fecha determinada',
  })
  @ApiQuery({
    name: 'fecha',
    required: true,
    example: '2025-01-31',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  @ApiCookieAuth('asmel_empresa_token')
  @UseGuards(JwtEmpresaGuard)
  @Get()
  async getDisponibilidad(
    @Req() req: Request,
    @Query('fecha') fecha: string,
  ) {
    if (!fecha) {
      return { message: 'La fecha es requerida ?fecha=YYYY-MM-DD' };
    }

    // ✅ DISPONIBILIDAD GLOBAL (NO por empresa)
    return this.availabilityService.getDisponibilidad(fecha);
  }
}
