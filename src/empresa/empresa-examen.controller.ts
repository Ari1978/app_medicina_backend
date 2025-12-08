import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { TurnoService } from 'src/turno/turno.service';

@Controller('empresa/examenes')
export class EmpresaExamenController {
  constructor(
    private readonly turnoService: TurnoService,
  ) {}

  @UseGuards(JwtEmpresaGuard)
  @Get('realizados')
  async listarRealizados(@Req() req: Request) {
    const empresa = req.user as { id: string };
    return this.turnoService.listarExamenesPorEmpresa(empresa.id);
  }
}
