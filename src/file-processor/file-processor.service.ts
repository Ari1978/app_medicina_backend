import { Injectable } from '@nestjs/common';
import { detectarCategoria, FileCategory } from './file-types';
import { OfficeConverter } from './converters/office.converter';
import { DicomConverter } from './converters/dicom.converter';
import { ImageConverter } from './converters/image.converter';

@Injectable()
export class FileProcessorService {
  async procesarArchivo(input: {
    pathOriginal: string;
    mimeType: string;
    filename: string;
  }) {
    const categoria = detectarCategoria(input.mimeType);

    switch (categoria) {
      // ============================
      // PDF (no se convierte)
      // ============================
      case FileCategory.PDF:
        return {
          original: input.pathOriginal,
          preview: input.pathOriginal,
        };

      // ============================
      // IMÁGENES → JPG normalizado
      // ============================
      case FileCategory.IMAGE: {
        const preview = await ImageConverter.generarPreviewJpg(
          input.pathOriginal,
          {
            maxWidth: 1400,
            quality: 85,
          },
        );

        return {
          original: input.pathOriginal,
          preview,
        };
      }

      // ============================
      // OFFICE → PDF
      // ============================
      case FileCategory.OFFICE:
        return this.convertirOfficeAPdf(input);

      // ============================
      // DICOM → JPG preview
      // ============================
      case FileCategory.DICOM:
        return this.generarPreviewDicom(input);

      // ============================
      // OTROS
      // ============================
      default:
        return {
          original: input.pathOriginal,
          preview: null,
        };
    }
  }

  // ============================
  // OFFICE → PDF
  // ============================
  private async convertirOfficeAPdf(input: {
    pathOriginal: string;
  }) {
    const pdfPath = await OfficeConverter.convertirAPdf(
      input.pathOriginal,
    );

    return {
      original: input.pathOriginal,
      preview: pdfPath,
    };
  }

  // ============================
  // DICOM → IMAGEN
  // ============================
  private async generarPreviewDicom(input: {
    pathOriginal: string;
  }) {
    const previewPath = await DicomConverter.generarPreview(
      input.pathOriginal,
    );

    return {
      original: input.pathOriginal,
      preview: previewPath,
    };
  }

  
}
