import {
  Controller,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { StaffPermisoGuard } from '../../auth/guards/staff-permiso.guard';

import { Roles } from '../../auth/decorators/roles.decorator';
import { StaffPermiso } from '../../auth/decorators/staff-permiso.decorator';

import { Role } from '../../auth/roles.enum';
import { StaffPermisoEnum } from '../../auth/enums/staff-permiso.enum';

import { TurnoService } from '../../turno/turno.service';

import { CreateResultadoFinalDto } from '../../turno/dto/create-resultado-final.dto';
import { EditResultadoFinalDto } from '../../turno/dto/edit-resultado-final.dto';

@ApiTags('Staff - Turnos')
@Controller('staff/turnos')
@UseGuards(JwtAuthGuard, RolesGuard, StaffPermisoGuard)
@Roles(Role.Staff)
@StaffPermiso(StaffPermisoEnum.TURNOS)
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

  // ----------------------------------
  // EVALUACIÓN MÉDICA
  // (mismo permiso TURNOS)
  // ----------------------------------

  @Get('evaluacion/medica')
  listarParaEvaluacion() {
    return this.turnoService.listarParaEvaluacionMedica();
  }
}
