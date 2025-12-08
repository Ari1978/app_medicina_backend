
import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { TurnoService } from '../turno/turno.service';
import { PdfStorageService } from '../examenes/pdf-storage.service';

@Controller('admin/examenes')
export class AdminExamenController {
  constructor(
    private readonly turnoService: TurnoService,
    private readonly pdfStorage: PdfStorageService,
  ) {}

  @Get('confirmados')
  listar() {
    return this.turnoService.listarExamenesConfirmados();
  }

  @Post(':id/pdf')
  @UseInterceptors(FileInterceptor('file'))
  async subirPdf(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const url = await this.pdfStorage.uploadPdf(file);
    return this.turnoService.cargarPDF(id, url);
  }

  @Get('export')
  async exportExcel(@Res() res) {
    const buffer = await this.turnoService.exportarExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="examenes_confirmados.xlsx"`,
    });

    return res.send(buffer);
  }
}
