import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import PDFDocument from 'pdfkit';

import { Turno, TurnoDocument } from './schema/turno.schema';
import { PracticasService } from '../practicas/practicas.service';

@Injectable()
export class TurnoPdfService {
  constructor(
    @InjectModel(Turno.name)
    private readonly turnoModel: Model<TurnoDocument>,
    // 👉 naming correcto (no rompe nada)
    private readonly practicasService: PracticasService,
  ) {}

  async generarPDF(id: string): Promise<Buffer> {
    const turno = await this.turnoModel.findById(id).lean();

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    const doc = new PDFDocument({ margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    // -----------------------------------------------------------
    // ENCABEZADO PROFESIONAL ASMEL
    // -----------------------------------------------------------
    doc
      .fontSize(26)
      .fillColor('#0A3D62')
      .text('ASMEL - Comprobante de Turno', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor('#555')
      .text('Centro Médico ASMEL · Atención Empresarial', {
        align: 'center',
      })
      .text(
        'Teléfono: 11-0000-0000 — Email: contacto@asml.com',
        { align: 'center' },
      )
      .moveDown(1);

    drawLine(doc);

    // -----------------------------------------------------------
    // DATOS DEL EMPLEADO
    // -----------------------------------------------------------
    drawBox(doc, 'Datos del Empleado', [
      {
        label: 'Nombre',
        value: `${turno.empleadoNombre} ${turno.empleadoApellido}`,
      },
      { label: 'DNI', value: turno.empleadoDni },
      { label: 'Puesto', value: turno.puesto || 'No informado' },
    ]);

    doc.moveDown(1);

    // -----------------------------------------------------------
    // DETALLES DEL TURNO
    // -----------------------------------------------------------
    drawBox(doc, 'Detalles del Turno', [
      { label: 'Fecha', value: turno.fecha },
      { label: 'Hora', value: turno.hora },
      { label: 'Tipo', value: turno.tipo },
      { label: 'Motivo', value: turno.motivo ?? '—' },
    ]);

    doc.moveDown(1);

    // -----------------------------------------------------------
    // PRÁCTICAS INCLUIDAS (antes "estudios")
    // -----------------------------------------------------------
    if (turno.listaPracticas?.length) {
      const practicasIncluidas = turno.listaPracticas.map((e: any) => {
        const meta = this.practicasService.obtenerPorCodigo(e.codigo);
        return meta?.nombre ?? `Código ${e.codigo}`;
      });

      drawListBox(doc, 'Prácticas Incluidas', practicasIncluidas);
      doc.moveDown(1);
    }

    // -----------------------------------------------------------
    // INDICACIONES
    // -----------------------------------------------------------
    drawListBox(doc, 'Indicaciones Generales', [
      'Presentarse 10 minutos antes del turno',
      'Llevar DNI (obligatorio)',
      'Ayuno de 8 horas si corresponde',
      'No consumir alcohol 24 horas antes',
      'Dormir bien la noche anterior',
      'Traer estudios previos si corresponde',
    ]);

    doc.moveDown(2);

    // -----------------------------------------------------------
    // FOOTER
    // -----------------------------------------------------------
    doc
      .fontSize(10)
      .fillColor('#777')
      .text('Documento generado automáticamente por ASMEL', {
        align: 'center',
      })
      .text('Queda prohibida su alteración o uso indebido.', {
        align: 'center',
      });

    doc.end();

    return new Promise((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(buffers))),
    );
  }
}

// =====================================================================
// UTILIDADES PDF
// =====================================================================

function drawLine(doc: any) {
  doc
    .moveTo(40, doc.y)
    .lineTo(550, doc.y)
    .lineWidth(1)
    .strokeColor('#CCCCCC')
    .stroke()
    .moveDown(1);
}

function drawBox(
  doc: any,
  title: string,
  items: { label: string; value: string }[],
) {
  doc
    .fontSize(16)
    .fillColor('#0A3D62')
    .text(title, { underline: true })
    .moveDown(0.5);

  items.forEach((item) => {
    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text(`${item.label}: `, { continued: true });

    doc.font('Helvetica').fillColor('#333').text(item.value);
  });
}

function drawListBox(doc: any, title: string, items: string[]) {
  doc
    .fontSize(16)
    .fillColor('#0A3D62')
    .text(title, { underline: true })
    .moveDown(0.3);

  doc.fontSize(12).fillColor('#333');

  items.forEach((i) => {
    doc.text(`• ${i}`);
  });
}
