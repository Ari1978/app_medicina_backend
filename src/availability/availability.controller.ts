import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { Request } from 'express';

@Controller('empresa/disponibilidad')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

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
