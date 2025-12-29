import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Turno, TurnoDocument } from './schema/turno.schema';

import { AvailabilityEventsService } from '../availability/availability.events.service';
import { AvailabilityService } from '../availability/availability.service';
import { PracticasService } from '../practicas/practicas.service';

import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as path from 'path';

import { CreateTurnoDto } from './dto/create-turno.dto';
import { CreateResultadoFinalDto } from './dto/create-resultado-final.dto';
import { EditResultadoFinalDto } from './dto/edit-resultado-final.dto';
import { isValidObjectId } from 'mongoose';
import { logger } from '../logger/winston.logger';
import { PerfilExamenService } from '../perfil-examen/perfil-examen.service';

@Injectable()
export class TurnoService {
  constructor(
    @InjectModel(Turno.name)
    private readonly turnoModel: Model<TurnoDocument>,

    @Inject(forwardRef(() => AvailabilityService))
    private readonly availabilityService: AvailabilityService,

    private readonly estudiosService: PracticasService,

    private readonly perfilExamenService: PerfilExamenService,
  ) {}

  // ============================================================
  // HELPERS
  // ============================================================
  private toObjectId(id: string, label = 'id') {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`${label} inválido`);
    }
    return new Types.ObjectId(id);
  }

  private ensureArray(value: any, fieldName: string) {
    if (!Array.isArray(value)) {
      throw new BadRequestException(`${fieldName} must be an array`);
    }
    return value;
  }

  // ============================================================
  // HELPERS FECHA
  // ============================================================
  private rangoFecha(fechaStr: string) {
    const inicio = new Date(`${fechaStr}T00:00:00.000Z`);
    const fin = new Date(`${fechaStr}T23:59:59.999Z`);
    return { inicio, fin };
  }

  // ============================================================
  // CREAR TURNO
  // ============================================================
  async crearTurno(empresaId: string, dto: CreateTurnoDto) {
    try {
      const empresaObjectId = this.toObjectId(empresaId, 'empresaId');

      if (!dto?.tipo) {
        throw new BadRequestException('Falta tipo');
      }

      // =========================
      // PRÁCTICAS (BASE)
      // =========================
      let listaPracticas = dto.listaPracticas ?? [];
      this.ensureArray(listaPracticas, 'listaPracticas');

      // =========================
      // DATA BASE TURNO
      // =========================
      const data: Partial<Turno> & any = {
        empresa: empresaObjectId,
        tipo: dto.tipo,

        empleadoNombre: dto.empleadoNombre,
        empleadoApellido: dto.empleadoApellido,
        empleadoDni: dto.empleadoDni,
        puesto: dto.puesto,

        // 🔒 FECHA COMO STRING (NO TOCAR)
        fecha: dto.fecha, // "2025-12-29"
        hora: dto.hora, // "07:30"

        solicitanteNombre: dto.solicitanteNombre,
        solicitanteApellido: dto.solicitanteApellido,
        solicitanteCelular: dto.solicitanteCelular,

        estado: 'provisional',
        motivo: dto.motivo,
        listaPracticas: [],
      };

      // =========================
      // EXAMEN → PERFIL OBLIGATORIO
      // =========================
      if (dto.tipo === 'examen') {
        if (!dto.perfilExamen) {
          throw new BadRequestException('El perfil de examen es obligatorio');
        }

        data.perfilExamen = dto.perfilExamen;

        // 👉 FIX CLAVE:
        // Si el front NO manda prácticas, se cargan desde el perfil
        if (listaPracticas.length === 0) {
          const perfil = await this.perfilExamenService.findById(
            dto.perfilExamen,
          );

          if (!perfil || !Array.isArray(perfil.practicas)) {
            throw new BadRequestException(
              'Perfil de examen inválido o sin prácticas',
            );
          }

          data.listaPracticas = perfil.practicas.filter(Boolean).map((p) => ({
            codigo: String(p!.codigo),
            estado: 'pendiente',
          }));
        } else {
          // si vienen prácticas desde el front, se validan
          this.estudiosService.validarCodigos(
            listaPracticas.map((p) => String(p.codigo)),
          );

          data.listaPracticas = listaPracticas;
        }
      }

      // =========================
      // ESTUDIOS (SIN AUTO-CARGA)
      // =========================
      if (dto.tipo === 'estudios') {
        if (listaPracticas.length > 0) {
          this.estudiosService.validarCodigos(
            listaPracticas.map((p) => String(p.codigo)),
          );
          data.listaPracticas = listaPracticas;
        }
      }

      // =========================
      // CREAR TURNO
      // =========================
      const turno = await this.turnoModel.create(data);

      // =========================
      // INVALIDAR CACHE DISPONIBILIDAD
      // =========================
      await this.availabilityService.invalidateCache(dto.fecha);

      logger.info(
        `Turno creado | id=${turno._id} | tipo=${dto.tipo} | empresa=${empresaId}`,
        { context: 'TurnoService' },
      );

      return turno;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al crear turno | empresa=${empresaId} | ${err.message}`,
        { context: 'TurnoService' },
      );

      throw err;
    }
  }

  // ============================================================
  // LISTADOS EMPRESA
  // ============================================================
  listarTodos(empresaId: string) {
    const empresaObjectId = this.toObjectId(empresaId, 'empresaId');

    return this.turnoModel
      .find({ empresa: empresaObjectId })
      .sort({ fecha: 1, hora: 1 });
  }

  listarPorDia(empresaId: string, fecha: string) {
    const empresaObjectId = this.toObjectId(empresaId, 'empresaId');
    const { inicio, fin } = this.rangoFecha(fecha);

    return this.turnoModel
      .find({
        empresa: empresaObjectId,
        fecha: { $gte: inicio, $lte: fin },
      })
      .sort({ hora: 1 });
  }

  // ============================================================
  // ESTADOS
  // ============================================================
  async cancelarTurno(empresaId: string, id: string) {
    const empresaObjectId = this.toObjectId(empresaId, 'empresaId');

    const turno = await this.turnoModel.findOne({
      _id: id,
      empresa: empresaObjectId,
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    // =========================
    // CAMBIAR ESTADO
    // =========================
    turno.estado = 'cancelado';
    await turno.save();

    // =========================
    // INVALIDAR CACHE DISPONIBILIDAD
    // =========================
    const fechaKey = new Date(turno.fecha).toISOString().slice(0, 10);
    await this.availabilityService.invalidateCache(fechaKey);

    return { message: 'Turno cancelado' };
  }

  async confirmarTurno(empresaId: string, id: string) {
    const empresaObjectId = this.toObjectId(empresaId, 'empresaId');

    const turno = await this.turnoModel.findOne({
      _id: id,
      empresa: empresaObjectId,
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    // =========================
    // CAMBIAR ESTADO
    // =========================
    turno.estado = 'confirmado';
    await turno.save();

    // =========================
    // INVALIDAR DISPONIBILIDAD
    // =========================
    const fechaKey = new Date(turno.fecha).toISOString().slice(0, 10);
    await this.availabilityService.invalidateCache(fechaKey);

    return { message: 'Turno confirmado' };
  }

  // ============================================================
  // BÚSQUEDAS
  // ============================================================
  async buscarPorId(id: string) {
    const turno = await this.turnoModel
      .findById(id)
      .populate('empresa', 'razonSocial cuit');

    if (!turno) throw new NotFoundException('Turno no encontrado');

    return turno;
  }

  // ✅ para el endpoint /empresa/turnos/:id/resultados
  async buscarPorIdEmpresa(empresaId: string, id: string) {
    const empresaObjectId = this.toObjectId(empresaId, 'empresaId');

    const turno = await this.turnoModel
      .findOne({ _id: id, empresa: empresaObjectId })
      .populate('empresa', 'razonSocial cuit');

    if (!turno) throw new NotFoundException('Turno no encontrado');

    return turno;
  }

  listarTurnosConfirmadosPorEmpresa(empresaId: string) {
    const empresaObjectId = this.toObjectId(empresaId, 'empresaId');

    return this.turnoModel
      .find({ empresa: empresaObjectId, estado: 'confirmado' })
      .sort({ fecha: -1, hora: -1 });
  }

  listarTurnosRealizadosPorEmpresa(empresaId: string) {
    const empresaObjectId = this.toObjectId(empresaId, 'empresaId');

    return this.turnoModel
      .find({ empresa: empresaObjectId, estado: 'realizado' })
      .sort({ fecha: -1, hora: -1 });
  }

  listarPorFechaGlobal(fecha: string) {
    return this.turnoModel
      .find({
        fecha: fecha, // ✅ string vs string
        estado: { $ne: 'cancelado' },
      })
      .sort({ hora: 1 });
  }

  // ============================================================
  // PDF / EXCEL
  // ============================================================
  async cargarPDF(id: string, url: string) {
    const turno = await this.turnoModel.findById(id);
    if (!turno) throw new NotFoundException('Turno no encontrado');

    turno.pdfResultado = url;
    await turno.save();

    return { message: 'PDF cargado correctamente' };
  }

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
    ];

    turnos.forEach((t: any) => {
      ws.addRow({
        empresa: t.empresa?.razonSocial,
        cuit: t.empresa?.cuit,
        apellido: t.empleadoApellido,
        nombre: t.empleadoNombre,
        dni: t.empleadoDni,
        puesto: t.puesto,
        fecha: t.fecha,
        hora: t.hora,
      });
    });

    return wb.xlsx.writeBuffer();
  }

  // ============================================================
  // RESULTADO FINAL
  // ============================================================
  async cargarResultadoFinal(id: string, dto: CreateResultadoFinalDto) {
    const turno = await this.turnoModel.findById(id);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turno.estado !== 'confirmado') {
      throw new BadRequestException(
        'Solo se pueden cargar resultados en turnos confirmados',
      );
    }

    // Validar códigos de prácticas
    this.estudiosService.validarCodigos(
      dto.practicas.map((p) => String(p.codigo)),
    );

    // Guardar resultado final
    turno.resultadoFinal = {
      practicas: dto.practicas,
      aptitud: dto.aptitud,
      observacionGeneral: dto.observacionGeneral,
    };

    turno.estado = 'realizado';
    await turno.save();

    // ✅ INVALIDAR DISPONIBILIDAD (fecha es STRING YYYY-MM-DD)
    const fechaKey = turno.fecha;
    await this.availabilityService.invalidateCache(fechaKey);

    return { message: 'Resultado cargado correctamente' };
  }

  async editarResultadoFinal(id: string, dto: EditResultadoFinalDto) {
    const turno = await this.turnoModel.findById(id);
    if (!turno) throw new NotFoundException('Turno no encontrado');

    if (turno.estado !== 'realizado') {
      throw new BadRequestException(
        'Solo se pueden editar resultados ya realizados',
      );
    }

    if (!turno.resultadoFinal) {
      throw new BadRequestException(
        'El turno no tiene resultado final cargado',
      );
    }

    if (dto.practicas !== undefined) {
      this.estudiosService.validarCodigos(
        dto.practicas.map((p) => String(p.codigo)),
      );
      turno.resultadoFinal.practicas = dto.practicas;
    }

    if (dto.aptitud !== undefined) {
      turno.resultadoFinal.aptitud = dto.aptitud;
    }

    if (dto.observacionGeneral !== undefined) {
      turno.resultadoFinal.observacionGeneral = dto.observacionGeneral;
    }

    await turno.save();

    return { message: 'Resultado actualizado correctamente' };
  }

  // ============================================================
  // EXÁMENES
  // ============================================================
  listarExamenesConfirmados() {
    return this.turnoModel
      .find({ tipo: 'examen', estado: 'confirmado' })
      .populate('empresa', 'razonSocial cuit')
      .sort({ fecha: -1, hora: -1 });
  }

  // ============================================================
  // MÉTODOS STAFF
  // ============================================================
  async obtenerDashboardStaff() {
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const totalHoy = await this.contarPorFecha(hoy);
    const pendientes = await this.contarPorEstado('confirmado');
    const completados = await this.contarPorEstado('realizado');
    const proximos = await this.listarProximosTurnos(5);

    return { totalHoy, pendientes, completados, proximos };
  }

  listarPorFechaStaff(fecha: string) {
    return this.turnoModel
      .find({
        tipo: 'examen',
        fecha, // 👈 comparación directa por string
        estado: { $ne: 'cancelado' },
      })
      .populate('empresa', 'razonSocial cuit')
      .sort({ hora: 1 });
  }

  obtenerEmpresasConExamenesConfirmados() {
    return this.turnoModel.aggregate([
      { $match: { tipo: 'examen', estado: 'confirmado' } },
      { $group: { _id: '$empresa', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'empresas',
          localField: '_id',
          foreignField: '_id',
          as: 'empresa',
        },
      },
      { $unwind: '$empresa' },
      {
        $project: {
          _id: '$empresa._id',
          razonSocial: '$empresa.razonSocial',
          cantidad: 1,
        },
      },
    ]);
  }

  listarTurnosRealizados() {
    return this.turnoModel
      .find({ estado: 'realizado' })
      .populate('empresa', 'razonSocial cuit')
      .sort({ fecha: -1 });
  }

  contarPorFecha(fecha: string) {
    return this.turnoModel.countDocuments({
      fecha, // 👈 string exacto YYYY-MM-DD
    });
  }

  contarPorEstado(
    estado:
      | 'provisional'
      | 'confirmado'
      | 'realizado'
      | 'ausente'
      | 'cancelado',
  ) {
    return this.turnoModel.countDocuments({ estado });
  }

  listarProximosTurnos(limit = 5) {
    return this.turnoModel
      .find({ estado: 'confirmado' })
      .sort({ fecha: 1, hora: 1 })
      .limit(limit);
  }

  // ============================================================
  // STAFF → ACTUALIZAR PRACTICAS
  // ============================================================
  async actualizarPracticasStaff(id: string, listaPracticas: string[]) {
    const turno = await this.turnoModel.findById(id);
    if (!turno) throw new NotFoundException('Turno no encontrado');

    this.ensureArray(listaPracticas, 'listaPracticas');

    // validar códigos
    this.estudiosService.validarCodigos(listaPracticas);

    // convertir a estructura operativa
    turno.listaPracticas = listaPracticas.map((codigo) => ({
      codigo,
      estado: 'pendiente',
    }));

    await turno.save();

    return { message: 'Prácticas actualizadas' };
  }

  // ============================================================
  // VER DETALLE DE TURNO (STAFF)
  // ============================================================
  async obtenerTurnoStaff(turnoId: string) {
    if (!isValidObjectId(turnoId)) {
      throw new NotFoundException('ID de turno inválido');
    }

    const turno = await this.turnoModel
      .findById(turnoId)
      .select({
        empresa: 1,
        empleadoNombre: 1,
        empleadoApellido: 1,
        empleadoDni: 1,
        puesto: 1,
        fecha: 1, // string YYYY-MM-DD
        hora: 1,
        listaPracticas: 1,
        resultadoFinal: 1,
        createdAt: 1,
        estado: 1,
      })
      .lean();

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return turno;
  }

  // ============================================================
  // PDF RESUMEN (STAFF)
  // ============================================================
  async generarPdfResumen(turnoId: string): Promise<Buffer> {
    if (!isValidObjectId(turnoId)) {
      throw new NotFoundException('ID de turno inválido');
    }

    const turno = await this.turnoModel
      .findById(turnoId)
      .populate('empresa', 'razonSocial cuit')
      .lean();

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    // 🔒 SOLO TURNOS FINALIZADOS
    if (turno.estado !== 'realizado') {
      throw new BadRequestException('El informe aún no está cerrado');
    }

    // empresa puede ser ObjectId o documento
    const empresa =
      typeof turno.empresa === 'object' && turno.empresa !== null
        ? turno.empresa
        : null;

    // ========================
    // PDF INIT
    // ========================
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (c) => chunks.push(c));

    // ========================
    // LOGO
    // ========================
    const logoPath = path.join(
      process.cwd(),
      'src',
      'assets',
      'logo-asmel.png',
    );

    try {
      doc.image(logoPath, 40, 30, { width: 110 });
      doc.moveDown(3);
    } catch {
      // si no hay logo, no rompe el PDF
    }

    // ========================
    // HEADER
    // ========================
    doc
      .fontSize(18)
      .text('INFORME MÉDICO LABORAL', { align: 'center' })
      .moveDown();

    doc.fontSize(12);
    doc.text(`Empresa: ${empresa?.razonSocial || '—'}`);
    doc.text(`Postulante: ${turno.empleadoNombre} ${turno.empleadoApellido}`);
    doc.text(`DNI: ${turno.empleadoDni}`);
    doc.text(`Puesto: ${turno.puesto}`);
    doc.text(`Fecha: ${turno.fecha}`); // 👈 string directo
    doc.moveDown();

    // ========================
    // PRÁCTICAS
    // ========================
    doc.fontSize(14).text('Prácticas realizadas');
    doc.moveDown(0.5);

    if (
      Array.isArray(turno.listaPracticas) &&
      turno.listaPracticas.length > 0
    ) {
      for (const p of turno.listaPracticas) {
        const practica = await this.estudiosService.obtenerPorCodigo(
          String(p.codigo),
        );

        doc
          .fontSize(11)
          .text(`• ${practica?.nombre || `Código ${p.codigo}`}`, {
            indent: 10,
          });
      }
    } else {
      doc.fontSize(11).text('—');
    }

    doc.moveDown();

    // ========================
    // RESULTADO FINAL
    // ========================
    doc.fontSize(14).text('Resultado final');
    doc.moveDown(0.5);

    if (turno.resultadoFinal) {
      doc.fontSize(11).text(`Aptitud: ${turno.resultadoFinal.aptitud}`);
      doc.moveDown(0.5);
      doc.text(turno.resultadoFinal.observacionGeneral || '—');
    } else {
      doc.fontSize(11).text('—');
    }

    doc.moveDown();

    // ========================
    // FIRMA / LEGAL
    // ========================
    doc.fontSize(10);
    doc.text('Documento generado por ASMEL');
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`);

    doc.end();

    return Buffer.concat(chunks);
  }

  // ============================================================
  // LISTAR PARA EVALUACIÓN MÉDICA
  // ============================================================
  async listarParaEvaluacionMedica() {
    return this.turnoModel
      .find({
        estado: 'confirmado',
        listaPracticas: { $exists: true, $not: { $size: 0 } },
      })
      .populate('empresa', 'razonSocial')
      .sort({ fecha: 1, hora: 1 }); // orden string seguro
  }
}
