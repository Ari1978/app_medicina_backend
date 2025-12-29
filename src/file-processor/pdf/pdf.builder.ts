import PDFDocument from 'pdfkit';
import * as fs from 'fs';

export class PdfBuilder {
  async crearPdf(params: {
    imagePath: string;
    outputPdf: string;
    paciente: string;
    estudio: string;
    fecha: string;
  }) {
    const doc = new PDFDocument({ size: 'A4' });
    doc.pipe(fs.createWriteStream(params.outputPdf));

    doc.fontSize(16).text('ASMEL - Informe Médico', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).text(`Paciente: ${params.paciente}`);
    doc.text(`Estudio: ${params.estudio}`);
    doc.text(`Fecha: ${params.fecha}`);
    doc.moveDown();

    doc.image(params.imagePath, {
      fit: [500, 500],
      align: 'center',
    });

    doc.moveDown();
    doc
      .fontSize(8)
      .text(
        'Documento derivado de imagen DICOM original. No sustituye diagnóstico médico.',
        { align: 'center' },
      );

    doc.end();
  }
}
