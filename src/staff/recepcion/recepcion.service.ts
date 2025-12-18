import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Turno, TurnoDocument } from '../../turno/schema/turno.schema';
import { logger } from '../../logger/winston.logger';

@Injectable()
export class RecepcionService {
  constructor(
    @InjectModel(Turno.name)
    private readonly turnoModel: Model<TurnoDocument>,
  ) {}

  // ============================================================
  // TURNOS DEL DÍA (HOY)
  // ============================================================
  async turnosDeHoy() {
    const hoy = new Date().toISOString().substring(0, 10);

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
        fecha,
        estado: { $ne: 'cancelado' },
      })
      .populate('empresa', 'razonSocial cuit')
      .sort({ hora: 1 });
  }

  // ============================================================
  // BUSCADOR INTELIGENTE (nombre / apellido / DNI)
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
  async cambiarEstadoRecepcion(
    id: string,
    estado: 'confirmado' | 'ausente',
  ) {
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
  // DATOS PARA IMPRESIÓN (SOLO CONFIRMADOS)
  // ============================================================
  async datosParaImpresion(id: string) {
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

    // 🔐 Type narrowing correcto
    const empresa =
      typeof turno.empresa === 'string'
        ? undefined
        : turno.empresa.razonSocial;

    return {
      protocolo: turno._id,
      fecha: turno.fecha,
      hora: turno.hora,
      paciente: `${turno.empleadoApellido} ${turno.empleadoNombre}`,
      dni: turno.empleadoDni,
      empresa,
      estudios: turno.listaEstudios ?? [],
    };
  }
}
