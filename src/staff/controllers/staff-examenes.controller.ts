import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { AuthGuard } from '@nestjs/passport';
import { JwtStaffGuard } from '../../auth/guards/staff-jwt.guard';

import { TurnoService } from '../../turno/turno.service';
import { PdfStorageService } from '../../examenes/pdf-storage.service';

@Controller('staff/examenes')
@UseGuards(AuthGuard('staff-jwt'), JwtStaffGuard)
export class StaffExamenesController {
  constructor(
    private readonly turnoService: TurnoService,
    private readonly pdfStorage: PdfStorageService,
  ) {}

  // ===============================
  // DASHBOARD PRINCIPAL
  // ===============================
  @Get('dashboard')
  async dashboard() {
    return this.turnoService.obtenerDashboardStaff();
  }

  // ===============================
  // EXÁMENES DE HOY
  // ===============================
  @Get('hoy')
  async listarHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    const turnos = await this.turnoService.listarExamenesConfirmados();
    return turnos.filter(t => t.fecha === hoy);
  }

  // ===============================
  // TODOS LOS EXÁMENES CONFIRMADOS
  // ===============================
  @Get('confirmados')
  listarConfirmados() {
    return this.turnoService.listarExamenesConfirmados();
  }

  // ===============================
  // CARGA DE PDF
  // ===============================
  @Post(':id/pdf')
  @UseInterceptors(FileInterceptor('file'))
  async subirPdf(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.pdfStorage.uploadPdf(file);
    const turnoActualizado = await this.turnoService.cargarPDF(id, url);

    return {
      message: 'PDF cargado correctamente',
      url,
      turnoActualizado,
    };
  }

  // ===============================
// TURNOS POR FECHA SELECCIONADA
// ===============================
@Get("por-fecha/:fecha")
async porFecha(@Param("fecha") fecha: string) {
  return this.turnoService.listarPorFechaStaff(fecha);
}

}
