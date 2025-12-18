import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { TurnoService } from '../turno/turno.service';
import { PdfStorageService } from '../examenes/pdf-storage.service';

@ApiTags('Admin - Exámenes')
@Controller('admin/examenes')
export class AdminExamenController {
  constructor(
    private readonly turnoService: TurnoService,
    private readonly pdfStorage: PdfStorageService,
  ) {}

  // ===============================
  // EXÁMENES CONFIRMADOS
  // ===============================
  @ApiOperation({
    summary: 'Listar exámenes confirmados',
  })
  @Get('confirmados')
  listar() {
    return this.turnoService.listarExamenesConfirmados();
  }

  // ===============================
  // SUBIR PDF
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
    return this.turnoService.cargarPDF(id, url);
  }

  // ===============================
  // EXPORTAR EXCEL
  // ===============================
  @ApiOperation({
    summary: 'Exportar exámenes confirmados a Excel',
  })
  @Get('export')
  async exportExcel(@Res() res: Response) {
    const buffer = await this.turnoService.exportarExcel();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename="examenes_confirmados.xlsx"',
    });

    return res.send(buffer);
  }
}
