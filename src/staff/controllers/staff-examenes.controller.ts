import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';

import { ApiTags, ApiOperation, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';

import { TurnoService } from '../../turno/turno.service';
import { PdfStorageService } from '../../examenes/pdf-storage.service';

import { CreateResultadoFinalDto } from '../../turno/dto/create-resultado-final.dto';

@ApiTags('Staff - Exámenes')
@Controller('staff/examenes')
@UseGuards(JwtStaffGuard)
export class StaffExamenesController {
  constructor(
    private readonly turnoService: TurnoService,
    private readonly pdfStorage: PdfStorageService,
  ) {}

  // ===============================
  // DASHBOARD
  // ===============================
  @ApiOperation({
    summary: 'Dashboard de exámenes (resumen y próximos turnos)',
  })
  @Get('dashboard')
  dashboard() {
    return this.turnoService.obtenerDashboardStaff();
  }

  // ===============================
  // EXÁMENES DE HOY
  // ===============================
  @ApiOperation({
    summary: 'Listar exámenes confirmados del día de hoy',
  })
  @Get('hoy')
  async listarHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    const turnos = await this.turnoService.listarExamenesConfirmados();
    return turnos.filter(t => t.fecha === hoy);
  }

  // ===============================
  // CONFIRMADOS
  // ===============================
  @ApiOperation({
    summary: 'Listar exámenes confirmados',
  })
  @Get('confirmados')
  listarConfirmados() {
    return this.turnoService.listarExamenesConfirmados();
  }

  // ===============================
  // TURNOS POR FECHA
  // ===============================
  @ApiOperation({
    summary: 'Listar turnos por fecha (staff)',
  })
  @ApiParam({
    name: 'fecha',
    example: '2025-01-31',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  @Get('por-fecha/:fecha')
  porFecha(@Param('fecha') fecha: string) {
    return this.turnoService.listarPorFechaStaff(fecha);
  }

  // ===============================
  // CARGAR PDF
  // ===============================
  @ApiOperation({
    summary: 'Subir PDF del resultado del examen',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post(':id/pdf')
  @UseInterceptors(FileInterceptor('file'))
  async subirPdf(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.pdfStorage.uploadPdf(file);
    await this.turnoService.cargarPDF(id, url);

    return {
      message: 'PDF cargado correctamente',
      url,
    };
  }

  // ===============================
  // CARGAR RESULTADO FINAL (CREATE)
  // CONFIRMADO → REALIZADO
  // ===============================
  @ApiOperation({
    summary: 'Cargar resultado final del examen (CONFIRMADO → REALIZADO)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del turno',
  })
  @Patch('turnos/:id/resultado-final')
  cargarResultadoFinal(
    @Param('id') id: string,
    @Body() dto: CreateResultadoFinalDto,
  ) {
    return this.turnoService.cargarResultadoFinal(id, dto);
  }
}
