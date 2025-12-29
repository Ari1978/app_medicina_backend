import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

import { DicomPreviewService } from './dicom.preview.service';
import { PdfBuilder } from '../pdf/pdf.builder';

@Injectable()
export class DicomPdfService {
  constructor(
    private readonly previewService: DicomPreviewService,
    private readonly pdfBuilder: PdfBuilder,
  ) {}

  /**
   * Genera un PDF clínico a partir de un DICOM
   * - NO modifica el DICOM original
   * - Genera preview temporal
   * - Devuelve path del PDF final
   */
  async generarPdfDesdeDicom(params: {
    dicomPath: string;
    paciente: string;
    estudio: string;
  }): Promise<{ pdfPath: string }> {
    try {
      if (!fs.existsSync(params.dicomPath)) {
        throw new Error('DICOM no encontrado');
      }

      const baseDir = path.dirname(params.dicomPath);
      const baseName = path.basename(params.dicomPath, '.dcm');

      const previewPath = path.join(baseDir, `${baseName}.preview.png`);
      const pdfPath = path.join(baseDir, `${baseName}.pdf`);

      // 1️⃣ DICOM → imagen preview
      await this.previewService.generarPreview(
        params.dicomPath,
        previewPath,
      );

      // 2️⃣ Imagen → PDF clínico
      await this.pdfBuilder.crearPdf({
        imagePath: previewPath,
        outputPdf: pdfPath,
        paciente: params.paciente,
        estudio: params.estudio,
        fecha: new Date().toISOString().split('T')[0],
      });

      // 3️⃣ Limpieza opcional (si no querés guardar preview)
      // fs.unlinkSync(previewPath);

      return { pdfPath };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error generando PDF desde DICOM',
      );
    }
  }
}
