import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Turno, TurnoDocument } from './schema/turno.schema';

import { AvailabilityEventsService } from '../availability/availability.events.service';
import { AvailabilityService } from '../availability/availability.service';

import * as ExcelJS from 'exceljs';

import { CreateResultadoFinalDto } from './dto/create-resultado-final.dto';
import { EditResultadoFinalDto } from './dto/edit-resultado-final.dto';

import { logger } from '../logger/winston.logger';

@Injectable()
export class TurnoService {
  constructor(
    @InjectModel(Turno.name)
    private readonly turnoModel: Model<TurnoDocument>,
    private readonly events: AvailabilityEventsService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  // ============================================================
  // CREAR TURNO (PROVISIONAL)
  // ============================================================
  async crearTurno(empresaId: string, dto: any) {
    try {
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
        motivo: dto.motivo,
      };

      if (dto.tipo === 'examen') {
        data.perfilExamen = dto.perfilExamen ?? null;
        data.estudiosAdicionales = dto.estudiosAdicionales ?? [];
        data.listaEstudios = dto.listaEstudios ?? [];
      }

      if (dto.tipo === 'estudios') {
        data.listaEstudios = dto.listaEstudios ?? [];
      }

      const turno = await this.turnoModel.create(data);
      await this.availabilityService.bloquearTurno(dto.fecha, dto.hora);

      logger.info(
        `Turno creado (provisional) | id=${turno._id} | empresa=${empresaId}`,
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
    return this.turnoModel
      .find({ empresa: empresaId })
      .sort({ fecha: 1, hora: 1 });
  }

  listarPorDia(empresaId: string, fecha: string) {
    return this.turnoModel
      .find({ empresa: empresaId, fecha })
      .sort({ hora: 1 });
  }

  // ============================================================
  // ESTADOS
  // ============================================================
  async cancelarTurno(empresaId: string, id: string) {
    const turno = await this.turnoModel.findOne({
      _id: id,
      empresa: empresaId,
    });

    if (!turno) throw new NotFoundException('Turno no encontrado');

    turno.estado = 'cancelado';
    await turno.save();

    this.events.publishTurnoUpdate({
      turnoId: turno._id.toString(),
      estado: turno.estado,
    });

    return { message: 'Turno cancelado' };
  }

  async confirmarTurno(empresaId: string, id: string) {
    const turno = await this.turnoModel.findOne({
      _id: id,
      empresa: empresaId,
    });

    if (!turno) throw new NotFoundException('Turno no encontrado');

    turno.estado = 'confirmado';
    await turno.save();

    this.events.publishTurnoUpdate({
      turnoId: turno._id.toString(),
      estado: turno.estado,
    });

    return { message: 'Turno confirmado' };
  }

  // ============================================================
  // BÚSQUEDAS
  // ============================================================
  buscarPorId(id: string) {
    return this.turnoModel
      .findById(id)
      .populate('empresa', 'razonSocial cuit');
  }

  listarTurnosConfirmadosPorEmpresa(empresaId: string) {
    return this.turnoModel
      .find({ empresa: empresaId, estado: 'confirmado' })
      .sort({ fecha: -1, hora: -1 });
  }

  listarTurnosRealizadosPorEmpresa(empresaId: string) {
    return this.turnoModel
      .find({ empresa: empresaId, estado: 'realizado' })
      .sort({ fecha: -1, hora: -1 });
  }

  listarPorFechaGlobal(fecha: string) {
    return this.turnoModel
      .find({ fecha, estado: { $ne: 'cancelado' } })
      .populate('empresa', 'razonSocial cuit')
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
    if (!turno) throw new NotFoundException('Turno no encontrado');

    if (turno.estado !== 'confirmado') {
      throw new BadRequestException(
        'Solo se pueden cargar resultados en turnos confirmados',
      );
    }

    turno.resultadoFinal = {
      estudios: dto.estudios,
      aptitud: dto.aptitud,
      observacionGeneral: dto.observacionGeneral,
    };

    turno.estado = 'realizado';
    await turno.save();

    this.events.publishTurnoUpdate({
      turnoId: turno._id.toString(),
      estado: turno.estado,
    });

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

    if (dto.estudios !== undefined) {
      turno.resultadoFinal.estudios = dto.estudios;
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
  // MÉTODOS STAFF (RESTAURADOS)
  // ============================================================
  async obtenerDashboardStaff() {
    const hoy = new Date().toISOString().slice(0, 10);

    const totalHoy = await this.contarPorFecha(hoy);
    const pendientes = await this.contarPorEstado('confirmado');
    const completados = await this.contarPorEstado('realizado');
    const proximos = await this.listarProximosTurnos(5);

    return { totalHoy, pendientes, completados, proximos };
  }

  listarPorFechaStaff(fecha: string) {
    return this.turnoModel
      .find({ fecha, estado: { $ne: 'cancelado' } })
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
    return this.turnoModel.countDocuments({ fecha });
  }

  contarPorEstado(
    estado: 'provisional' | 'confirmado' | 'realizado' | 'ausente' | 'cancelado',
  ) {
    return this.turnoModel.countDocuments({ estado });
  }

  listarProximosTurnos(limit = 5) {
    return this.turnoModel
      .find({ estado: 'confirmado' })
      .sort({ fecha: 1, hora: 1 })
      .limit(limit);
  }

  async actualizarEstudiosStaff(id: string, listaEstudios: any[]) {
    const turno = await this.turnoModel.findById(id);
    if (!turno) throw new NotFoundException('Turno no encontrado');

    turno.listaEstudios = listaEstudios;
    await turno.save();

    return { message: 'Estudios actualizados' };
  }
}
