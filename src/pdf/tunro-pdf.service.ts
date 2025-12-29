import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

type Practica = {
  codigo: string;
  nombre: string;
  sector: string;
};

type PayloadRecepcion = {
  turno: any;
  practicas: Practica[];
};

@Injectable()
export class TurnoPdfService {
  // A5
  private readonly pageSize: [number, number] = [420, 595];

  async generarOrdenRecepcion(payload: PayloadRecepcion): Promise<Buffer> {
    const { turno, practicas } = payload;

    const doc = new PDFDocument({
      size: this.pageSize,
      margins: { top: 34, left: 34, right: 34, bottom: 34 },
      info: { Title: 'Orden de Examen Médico - ASMEL', Author: 'ASMEL' },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // ---------------- Helpers ----------------
    const safe = (v: any, f = '—') =>
      v === undefined || v === null || String(v).trim() === '' ? f : String(v);

    const formatFecha = (f: any) =>
      f ? new Date(f).toLocaleDateString('es-AR') : '—';

    const fechaImpresion = new Date().toLocaleString('es-AR');

    const datosPaciente = {
      paciente: `${safe(turno.empleadoApellido)} ${safe(turno.empleadoNombre)}`,
      dni: safe(turno.empleadoDni),
      motivo: safe(turno.motivo),
      puesto: safe(turno.puesto),
      empresa:
        typeof turno.empresa === 'string'
          ? '—'
          : safe(turno.empresa?.razonSocial),
      turno: `${formatFecha(turno.fecha)} ${safe(turno.hora)}`,
    };

    // ---------------- Agrupar por sector (sin vacíos) ----------------
    const porSector = practicas.reduce((acc, p) => {
      if (!acc[p.sector]) acc[p.sector] = [];
      acc[p.sector].push(p);
      return acc;
    }, {} as Record<string, Practica[]>);

    const sectores = Object.entries(porSector).filter(
      ([, lista]) => lista.length > 0,
    );

    const totalPaginas = 1 + sectores.length; // 1 resumen + N sectores

    // =========================
    // PÁGINA 1 — RESUMEN
    // =========================
    let paginaActual = 1;

    this.renderHeader(doc, fechaImpresion);
    this.renderBloquePaciente(doc, datosPaciente);
    this.renderTablaPracticasDesde(doc, practicas, 240);
    this.renderFooter(doc, `Hoja ${paginaActual}/${totalPaginas}`);

    // =========================
    // PÁGINAS POR SECTOR
    // =========================
    for (let i = 0; i < sectores.length; i++) {
      const [sector, lista] = sectores[i];

      // 👉 addPage SOLO antes de escribir una nueva página
      doc.addPage();
      paginaActual++;

      this.renderHeader(doc, fechaImpresion);
      this.renderBloquePaciente(doc, datosPaciente);
      this.renderTituloSector(doc, sector);
      this.renderTablaPracticasDesde(doc, lista, 260);
      this.renderFooter(
        doc,
        `Hoja ${paginaActual}/${totalPaginas} – ${sector}`,
      );
    }

    doc.end();
    return done;
  }

  // =========================
  // RENDER HELPERS
  // =========================
  private renderHeader(
    doc: InstanceType<typeof PDFDocument>,
    fecha: string,
  ) {
    const { left, right } = doc.page.margins;
    const w = doc.page.width - left - right;

    doc.font('Helvetica-Bold').fontSize(18).text('Clínica ASMEL', left, 28);
    doc.font('Helvetica').fontSize(10).text('Orden de Examen Médico', left, 52);

    doc
      .moveTo(left, 70)
      .lineTo(doc.page.width - right, 70)
      .lineWidth(1)
      .strokeColor('#2563eb')
      .stroke();

    doc.fontSize(9).text(`Impresión: ${fecha}`, left, 78, {
      width: w,
      align: 'right',
    });
  }

  private renderBloquePaciente(
    doc: InstanceType<typeof PDFDocument>,
    d: any,
  ) {
    const { left, right } = doc.page.margins;
    const w = doc.page.width - left - right;

    const top = 98;
    const pad = 10;
    const colGap = 12;
    const colW = (w - colGap) / 2;

    doc
      .roundedRect(left, top, w, 120, 10)
      .strokeColor('#d1d5db')
      .stroke();

    let yL = top + pad;
    let yR = yL;

    this.field(doc, left + pad, yL, colW, 'Apellido y Nombre', d.paciente);
    yL += 22;
    this.field(doc, left + pad, yL, colW, 'DNI', d.dni);
    yL += 22;
    this.field(doc, left + pad, yL, colW, 'Motivo', d.motivo);
    yL += 22;
    this.field(doc, left + pad, yL, colW, 'Puesto', d.puesto);

    const xR = left + pad + colW + colGap;
    this.field(doc, xR, yR, colW, 'Empresa', d.empresa);
    yR += 22;
    this.field(doc, xR, yR, colW, 'Turno', d.turno);
  }

  private renderTituloSector(
    doc: InstanceType<typeof PDFDocument>,
    sector: string,
  ) {
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(`Servicio: ${sector}`, 34, 230);
  }

  private renderTablaPracticasDesde(
    doc: InstanceType<typeof PDFDocument>,
    practicas: Practica[],
    startY: number,
  ) {
    const { left, right } = doc.page.margins;
    const w = doc.page.width - left - right;

    let y = startY;

    doc.font('Helvetica-Bold').fontSize(12).text('Prácticas', left, y);
    y += 16;

    doc.font('Helvetica').fontSize(10);

    for (const p of practicas) {
      if (y > 520) break; // 🚫 no overflow → no páginas en blanco

      doc.text(p.nombre, left + 8, y, { width: w - 90 });
      doc
        .font('Helvetica-Bold')
        .text(p.codigo, left, y, { width: w, align: 'right' });
      doc.font('Helvetica');

      y += 18;
    }
  }

  private renderFooter(
    doc: InstanceType<typeof PDFDocument>,
    textoPagina: string,
  ) {
    const { left, right } = doc.page.margins;
    const w = doc.page.width - left - right;

    doc
      .fontSize(8)
      .fillColor('#6b7280')
      .text(
        `Documento generado por sistema ASMEL · ${textoPagina}`,
        left,
        560,
        { width: w, align: 'center' },
      );
  }

  private field(
    doc: InstanceType<typeof PDFDocument>,
    x: number,
    y: number,
    w: number,
    label: string,
    value: string,
  ) {
    doc.fontSize(9).fillColor('#6b7280').text(label, x, y, { width: w });
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#111')
      .text(value, x, y + 10, { width: w });
  }
}
