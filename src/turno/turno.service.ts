import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Turno, TurnoDocument } from './schema/turno.schema';

import { AvailabilityEventsService } from '../availability/availability.events.service';
import { AvailabilityService } from '../availability/availability.service';
import PDFDocument = require("pdfkit");
import * as ExcelJS from 'exceljs';

@Injectable()
export class TurnoService {
  constructor(
    @InjectModel(Turno.name)
    private readonly turnoModel: Model<TurnoDocument>,

    private readonly events: AvailabilityEventsService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  // ============================================================
  // ✔ CREAR TURNO
  // ============================================================
  async crearTurno(empresaId: string, dto: any) {
    const data: any = {
      empresa: empresaId,
      tipo: dto.tipo,

      empleadoNombre: dto.empleadoNombre,
      empleadoApellido: dto.empleadoApellido,
      empleadoDni: dto.empleadoDni,
      puesto: dto.puesto,

      fecha: dto.fecha,
      hora: dto.hora,

      solicitanteNombre: dto.solicitanteNombre,
      solicitanteApellido: dto.solicitanteApellido,
      solicitanteCelular: dto.solicitanteCelular,

      estado: 'provisional',
    };

    if (dto.tipo === 'examen') {
      data.motivo = dto.motivo;
      data.perfilExamen = dto.perfilExamen;
      data.estudiosAdicionales = dto.estudiosAdicionales ?? [];
      data.listaEstudios = dto.listaEstudios ?? [];
    }

    if (dto.tipo === 'estudios') {
      data.motivoEstudio = dto.motivoEstudio;
      data.listaEstudios = dto.listaEstudios;
    }

    const turno = await this.turnoModel.create(data);

    await this.availabilityService.bloquearTurno(dto.fecha, dto.hora);
    this.events.publishTurnoUpdate(empresaId, dto.fecha);

    return turno;
  }

  // ============================================================
  // ✔ LISTAR POR DÍA (EMPRESA)
  // ============================================================
  async listarPorDia(empresaId: string, fecha: string) {
    return this.turnoModel
      .find({ empresa: empresaId, fecha })
      .sort({ hora: 1 });
  }

  // ============================================================
  // ✔ LISTAR TODOS (EMPRESA)
  // ============================================================
  async listarTodos(empresaId: string) {
    return this.turnoModel
      .find({ empresa: empresaId })
      .sort({ fecha: 1, hora: 1 });
  }

  // ============================================================
  // ✔ CANCELAR
  // ============================================================
  async cancelarTurno(empresaId: string, id: string) {
    const turno = await this.turnoModel.findOne({ _id: id, empresa: empresaId });
    if (!turno) throw new Error('Turno no encontrado');

    turno.estado = 'cancelado';
    await turno.save();

    this.events.publishTurnoUpdate(empresaId, turno.fecha);
    return { message: 'Turno cancelado' };
  }

  // ============================================================
  // ✔ CONFIRMAR
  // ============================================================
  async confirmarTurno(empresaId: string, id: string) {
    const turno = await this.turnoModel.findOne({ _id: id, empresa: empresaId });
    if (!turno) throw new Error('Turno no encontrado');

    turno.estado = 'confirmado';
    await turno.save();

    this.events.publishTurnoUpdate(empresaId, turno.fecha);
    return { message: 'Turno confirmado' };
  }

  // ============================================================
  // ✔ LISTAR EXÁMENES CONFIRMADOS (STAFF)
  // ============================================================
  async listarExamenesConfirmados() {
    return this.turnoModel
      .find({
        tipo: 'examen',
        estado: 'confirmado',
      })
      .populate('empresa', 'razonSocial cuit')
      .sort({ fecha: -1, hora: -1 });
  }

  // ============================================================
  // ✔ CARGAR PDF
  // ============================================================
  async cargarPDF(id: string, url: string) {
    const turno = await this.turnoModel.findById(id);
    if (!turno) throw new Error('Turno no encontrado');

    turno.pdfResultado = url;
    await turno.save();

    return { message: 'PDF cargado correctamente' };
  }

  // ============================================================
  // ✔ EXPORTAR EXCEL
  // ============================================================
  async exportarExcel() {
    const turnos = await this.listarExamenesConfirmados();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Examenes Confirmados');

    ws.columns = [
      { header: 'Empresa', key: 'empresa', width: 30 },
      { header: 'CUIT', key: 'cuit', width: 15 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'DNI', key: 'dni', width: 15 },
      { header: 'Puesto', key: 'puesto', width: 25 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora', key: 'hora', width: 10 },
      { header: 'PDF Resultado', key: 'pdf', width: 50 },
    ];

    turnos.forEach((t: any) => {
      ws.addRow({
        empresa: t.empresa?.razonSocial || '',
        cuit: t.empresa?.cuit || '',
        apellido: t.empleadoApellido,
        nombre: t.empleadoNombre,
        dni: t.empleadoDni,
        puesto: t.puesto,
        fecha: t.fecha,
        hora: t.hora,
        pdf: t.pdfResultado || 'Pendiente',
      });
    });

    return wb.xlsx.writeBuffer();
  }

  // ============================================================
  // ✔ LISTAR EXÁMENES POR EMPRESA
  // ============================================================
  async listarExamenesPorEmpresa(empresaId: string) {
    return this.turnoModel
      .find({
        empresa: empresaId,
        tipo: 'examen',
        estado: 'confirmado',
      })
      .sort({ fecha: -1, hora: -1 });
  }

  // ============================================================
  // ✔ BUSCAR POR ID
  // ============================================================
  async buscarPorId(id: string) {
    return this.turnoModel
      .findById(id)
      .populate('empresa', 'razonSocial cuit');
  }

  // ============================================================
  // ✔ CONTAR POR FECHA
  // ============================================================
  async contarPorFecha(fecha: string) {
    return this.turnoModel.countDocuments({ fecha });
  }

  // ============================================================
  // ✔ CONTAR POR ESTADO
  // ============================================================
  async contarPorEstado(estado: string) {
    return this.turnoModel.countDocuments({ estado });
  }

  // ============================================================
  // ✔ PRÓXIMOS TURNOS (STAFF)
  // ============================================================
  async listarProximosTurnos(limit = 5) {
    const hoy = new Date().toISOString().split("T")[0];

    return this.turnoModel
      .find({ fecha: { $gte: hoy } })
      .populate('empresa', 'razonSocial')
      .sort({ fecha: 1, hora: 1 })
      .limit(limit);
  }

  // ============================================================
  // ✔ DASHBOARD STAFF
  // ============================================================
  async obtenerDashboardStaff() {
    const hoy = new Date().toISOString().split("T")[0];

    const totalHoy = await this.contarPorFecha(hoy);
    const pendientes = await this.contarPorEstado("pendiente");
    const completados = await this.contarPorEstado("completado");

    const proximos = await this.listarProximosTurnos(5);

    return {
      resumen: {
        totalHoy,
        pendientes,
        completados,
      },
      proximos,
    };
  }

  // ============================================================
  // ✔ LISTAR POR FECHA (STAFF) ✅ ESTE ES EL QUE USA TU TABLA
  // ============================================================
  async listarPorFechaStaff(fecha: string) {
    return this.turnoModel
      .find({ fecha })
      .populate('empresa', 'razonSocial cuit')
      .sort({ hora: 1 });
  }

  // ✅ LISTAR TURNOS GLOBALMENTE POR FECHA (NO por empresa)
async listarPorFechaGlobal(fecha: string) {
  return this.turnoModel.find({
    fecha,
    estado: { $ne: 'cancelado' },
  }).lean();
}

}


 