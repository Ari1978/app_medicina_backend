import { Controller, Header, Get, Query, Req, Res, UseGuards } from '@nestjs/common';  
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';

import { AvailabilityService } from './availability.service';
import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';


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
@Header('Cache-Control', 'no-store')
@Header('Pragma', 'no-cache')
@Header('Expires', '0')
async getDisponibilidad(
  @Query('fecha') fecha: string,
) {
  if (!fecha) {
    return { message: 'La fecha es requerida ?fecha=YYYY-MM-DD' };
  }

  return this.availabilityService.getDisponibilidad(fecha);
}
}
