import {
  Controller,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';
import { TurnoService } from '../../turno/turno.service';

import { CreateResultadoFinalDto } from '../../turno/dto/create-resultado-final.dto';
import { EditResultadoFinalDto } from '../../turno/dto/edit-resultado-final.dto';

@ApiTags('Staff - Turnos')
@UseGuards(JwtStaffGuard)
@Controller('staff/turnos')
export class StaffTurnosController {
  constructor(private readonly turnoService: TurnoService) {}

  // ----------------------------------
  // LISTADOS
  // ----------------------------------

  @ApiOperation({
    summary: 'Listar exámenes confirmados por empresa',
  })
  @ApiParam({
    name: 'empresaId',
    description: 'ID de la empresa',
  })
  @Get('confirmados/empresa/:empresaId')
  listarConfirmadosPorEmpresa(@Param('empresaId') empresaId: string) {
    return this.turnoService.listarTurnosConfirmadosPorEmpresa(empresaId);
  }

  @ApiOperation({
    summary: 'Listar empresas con exámenes confirmados',
  })
  @Get('empresas-con-examenes')
  listarEmpresasConExamenes() {
    return this.turnoService.obtenerEmpresasConExamenesConfirmados();
  }

  @ApiOperation({
    summary: 'Listar turnos realizados (para ver o editar resultados)',
  })
  @Get('realizados')
  listarRealizados() {
    return this.turnoService.listarTurnosRealizados();
  }

  // ----------------------------------
  // DETALLE
  // ----------------------------------

  @ApiOperation({
    summary: 'Ver detalle de un turno',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
  @Get(':id')
  verTurno(@Param('id') id: string) {
    return this.turnoService.buscarPorId(id);
  }

  // ----------------------------------
  // RESULTADO FINAL
  // ----------------------------------

  @ApiOperation({
    summary: 'Cargar resultado final (CONFIRMADO → REALIZADO)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
  @Patch(':id/resultado-final')
  cargarResultadoFinal(
    @Param('id') id: string,
    @Body() dto: CreateResultadoFinalDto,
  ) {
    return this.turnoService.cargarResultadoFinal(id, dto);
  }

  @ApiOperation({
    summary: 'Editar resultado final (REALIZADO → REALIZADO)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
  @Patch(':id/resultado-final/editar')
  editarResultadoFinal(
    @Param('id') id: string,
    @Body() dto: EditResultadoFinalDto,
  ) {
    return this.turnoService.editarResultadoFinal(id, dto);
  }
}
