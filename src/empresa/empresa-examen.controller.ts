import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Request } from 'express';

import { JwtEmpresaGuard } from '../auth/guards/jwt-empresa.guard';
import { TurnoService } from 'src/turno/turno.service';

@ApiTags('Empresa - Exámenes')
@Controller('empresa/examenes')
export class EmpresaExamenController {
  constructor(
    private readonly turnoService: TurnoService,
  ) {}

  // ===============================
  // EXÁMENES REALIZADOS POR EMPRESA
  // ===============================
  @ApiOperation({
    summary: 'Listar exámenes realizados de la empresa autenticada',
  })
  @UseGuards(JwtEmpresaGuard)
  @Get('realizados')
  async listarRealizados(@Req() req: Request) {
    const empresa = req.user as { id: string };
    return this.turnoService.listarTurnosRealizadosPorEmpresa(empresa.id);
  }
}
