import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Turno } from '../../turno/schema/turno.schema';

@Injectable()
export class RecepcionService {
  constructor(
    @InjectModel(Turno.name)
    private readonly turnoModel: Model<Turno>,
  ) {}

  // ----------------------------------------
  // ✅ TURNOS DEL DÍA
  // ----------------------------------------
  async turnosDeHoy() {
    const hoy = new Date().toISOString().substring(0, 10);

    return this.turnoModel
      .find({ fecha: hoy })
      .populate('empresa')
      .sort({ hora: 1 });
  }

  // ----------------------------------------
  // ✅ BUSCADOR INTELIGENTE
  // ----------------------------------------
  async buscar(query: string) {
    if (!query) return [];

    return this.turnoModel
      .find({
        $or: [
          { empleadoNombre: new RegExp(query, 'i') },
          { empleadoApellido: new RegExp(query, 'i') },
          { empleadoDni: new RegExp(query, 'i') },
        ],
      })
      .populate('empresa');
  }

  // ----------------------------------------
  // ✅ CONFIRMAR TURNO
  // ----------------------------------------
  async confirmarTurno(id: string) {
    const turno = await this.turnoModel.findByIdAndUpdate(
      id,
      { estado: 'confirmado' },
      { new: true },
    );

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return turno;
  }

  // ----------------------------------------
  // ✅ CAMBIAR ESTADO GENÉRICO
  // ----------------------------------------
  async cambiarEstado(id: string, estado: string) {
    const turno = await this.turnoModel.findByIdAndUpdate(
      id,
      { estado },
      { new: true },
    );

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    return turno;
  }

  // ----------------------------------------
  // ✅ DATOS PARA IMPRESIÓN (solo confirmados)
  // ----------------------------------------
  async datosParaImpresion(id: string) {
    const turno = await this.turnoModel
      .findById(id)
      .populate('empresa');

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turno.estado !== 'confirmado') {
      throw new BadRequestException(
        'El turno debe estar confirmado para imprimir',
      );
    }

    return {
      protocolo: turno._id,
      fecha: turno.fecha,
      hora: turno.hora,
      paciente: `${turno.empleadoApellido} ${turno.empleadoNombre}`,
      dni: turno.empleadoDni,
      empresa: (turno.empresa as any)?.razonSocial,
      estudios: turno.listaEstudios,
    };
  }
}
