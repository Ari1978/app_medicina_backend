import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Turno, TurnoDocument } from '../../turno/schema/turno.schema';
import { logger } from '../../logger/winston.logger';
import { PracticasService } from '../../practicas/practicas.service';
import { TurnoPdfService } from '../../pdf/tunro-pdf.service';
import {
  Paciente,
  PacienteDocument,
} from '../pacientes/schemas/paciente.schema';

@Injectable()
export class RecepcionService {
  constructor(
    @InjectModel(Turno.name)
    private readonly turnoModel: Model<TurnoDocument>,
    private readonly practicasService: PracticasService,
    private readonly pdfService: TurnoPdfService,
    @InjectModel(Paciente.name)
    private readonly pacienteModel: Model<PacienteDocument>,
  ) {}

  // ============================================================
  // TURNOS DEL DÍA (HOY)
  // ============================================================
  async turnosDeHoy() {
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    return this.turnoModel
      .find({
        fecha: hoy,
        estado: { $ne: 'cancelado' },
      })
      .populate('empresa', 'razonSocial cuit')
      .sort({ hora: 1 });
  }

  // ============================================================
  // TURNOS POR FECHA (GLOBAL)
  // ============================================================
  async listarPorFechaGlobal(fecha: string) {
    if (!fecha) {
      throw new BadRequestException('Fecha requerida');
    }

    return this.turnoModel
      .find({
        fecha, // 👈 comparación directa por string
        estado: { $ne: 'cancelado' },
      })
      .populate('empresa', 'razonSocial cuit')
      .sort({ hora: 1 });
  }

  // ============================================================
  // BUSCADOR INTELIGENTE
  // ============================================================
  async buscar(query: string) {
    if (!query) return [];

    return this.turnoModel
      .find({
        $or: [
          { empleadoNombre: new RegExp(query, 'i') },
          { empleadoApellido: new RegExp(query, 'i') },
          { empleadoDni: new RegExp(query, 'i') },
        ],
        estado: { $ne: 'cancelado' },
      })
      .populate('empresa', 'razonSocial cuit')
      .sort({ fecha: -1, hora: -1 });
  }

  // ============================================================
  // CAMBIAR ESTADO DESDE RECEPCIÓN
  // ============================================================
  async cambiarEstadoRecepcion(id: string, estado: 'confirmado' | 'ausente') {
    const turno = await this.turnoModel.findById(id);

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (!['confirmado', 'ausente'].includes(estado)) {
      throw new BadRequestException('Estado no permitido');
    }

    turno.estado = estado;
    await turno.save();

    logger.info(
      `Estado actualizado por recepción | turno=${id} | estado=${estado}`,
      { context: 'RecepcionService' },
    );

    return { message: 'Estado actualizado correctamente' };
  }

  // ============================================================
  // DATOS PARA IMPRESIÓN (POR SECTOR)
  // ============================================================
  async datosParaImpresionPorSector(id: string) {
    const turno = await this.turnoModel
      .findById(id)
      .populate('empresa', 'razonSocial cuit');

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turno.estado !== 'confirmado') {
      throw new BadRequestException(
        'El turno debe estar confirmado para imprimir',
      );
    }

    const catalogo = this.practicasService.listar();
    const mapPracticas = new Map(catalogo.map((p) => [p.codigo, p]));

    const practicasPorSector: Record<string, any[]> = {};

    for (const p of turno.listaPracticas ?? []) {
      const info = mapPracticas.get(p.codigo);
      if (!info) continue;

      if (!practicasPorSector[info.sector]) {
        practicasPorSector[info.sector] = [];
      }

      practicasPorSector[info.sector].push({
        codigo: info.codigo,
        nombre: info.nombre,
        estado: p.estado,
      });
    }

    return {
      turnoId: turno._id,
      fecha: turno.fecha,
      hora: turno.hora,
      paciente: `${turno.empleadoApellido} ${turno.empleadoNombre}`,
      dni: turno.empleadoDni,
      empresa:
        typeof turno.empresa === 'string'
          ? undefined
          : turno.empresa.razonSocial,
      practicasPorSector,
    };
  }

  // ============================================================
  // PDF RECEPCIÓN
  // ============================================================
  async generarPdfRecepcion(turnoId: string): Promise<Buffer> {
    const turno = await this.turnoModel
      .findById(turnoId)
      .populate('empresa', 'razonSocial cuit');

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turno.estado !== 'confirmado') {
      throw new BadRequestException('Solo se imprimen turnos confirmados');
    }

    const catalogo = this.practicasService.listar();
    const mapPracticas = new Map(catalogo.map((p) => [p.codigo, p]));

    const practicas = (turno.listaPracticas ?? []).map((p) => {
      const info = mapPracticas.get(p.codigo);

      return {
        codigo: p.codigo,
        nombre: info?.nombre ?? `Práctica (${p.codigo})`,
        sector: info?.sector ?? 'General',
      };
    });

    return this.pdfService.generarOrdenRecepcion({
      turno,
      practicas,
    });
  }

  // ============================================================
  // COMPATIBILIDAD
  // ============================================================
  async datosParaImpresion(id: string) {
    return this.datosParaImpresionPorSector(id);
  }

  async editarDatosPostulante(
    id: string,
    data: {
      empleadoNombre: string;
      empleadoApellido: string;
      empleadoDni: string;
    },
  ) {
    const turno = await this.turnoModel.findById(id);

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    // Validar DNI duplicado SOLO contra otros turnos/postulantes
    const duplicado = await this.turnoModel.exists({
      empleadoDni: data.empleadoDni,
      _id: { $ne: id },
    });

    if (duplicado) {
      throw new BadRequestException('DNI duplicado');
    }

    turno.empleadoNombre = data.empleadoNombre;
    turno.empleadoApellido = data.empleadoApellido;
    turno.empleadoDni = data.empleadoDni;

    await turno.save();

    return turno;
  }

  // ============================================================
// DAR DE ALTA PACIENTE DESDE TURNO
// ============================================================
async altaPacienteDesdeTurno(turnoId: string) {
  const turno = await this.turnoModel.findById(turnoId);

  if (!turno) {
    throw new NotFoundException('Turno no encontrado');
  }

  // Validación básica
  if (!turno.empleadoDni || !turno.empleadoApellido || !turno.empleadoNombre) {
    throw new BadRequestException('Datos del postulante incompletos');
  }

  // DNI duplicado
  const existente = await this.pacienteModel.findOne({
    dni: turno.empleadoDni,
  });

  if (existente) {
    throw new BadRequestException('El DNI ya existe como paciente');
  }

  // Crear paciente
  const paciente = await this.pacienteModel.create({
    empresa: turno.empresa,
    apellido: turno.empleadoApellido,
    nombre: turno.empleadoNombre,
    dni: turno.empleadoDni,
    puesto: turno.puesto || '',
    telefono: turno.solicitanteCelular || '',
    activo: true,
  });

  return {
    message: 'Paciente dado de alta correctamente',
    paciente,
  };
}

}
