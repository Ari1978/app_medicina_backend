import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  AdjuntoPractica,
  AdjuntoPracticaDocument,
  AdjuntoTipo,
  AdjuntoEstado,
} from './schemas/adjunto-practica.schema';

import { PracticasService } from '../practicas/practicas.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AuditoriaEvento } from '../auditoria/auditoria.evento';

export interface CrearAdjuntoInput {
  turnoId: string;
  codigoPractica: string;
  tipoServicio: string;
  path: string;
  mimeType: string;
  tipo: AdjuntoTipo;
  origen: 'servicio' | 'medico' | 'staff';
  usuarioId: string;
}

@Injectable()
export class AdjuntosService {
  constructor(
    @InjectModel(AdjuntoPractica.name)
    private readonly adjuntoModel: Model<AdjuntoPracticaDocument>,
    private readonly practicasService: PracticasService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // ============================
  // CREAR ADJUNTO
  // ============================
  async crearAdjunto(data: CrearAdjuntoInput) {
    await this.practicasService.obtenerPorCodigo(
      data.codigoPractica,
    );

    const adjunto = await this.adjuntoModel.create({
      turnoId: new Types.ObjectId(data.turnoId),
      codigoPractica: data.codigoPractica,
      tipoServicio: data.tipoServicio,
      path: data.path,
      mimeType: data.mimeType,
      tipo: data.tipo,
      version: 1,
      estado: AdjuntoEstado.BORRADOR,
      origen: data.origen,
      usuarioId: data.usuarioId,
    });

    // 🧾 AUDITORÍA
    await this.auditoriaService.registrar({
      evento: AuditoriaEvento.SUBE_ADJUNTO,
      usuarioId: data.usuarioId,
      rol: data.origen,
      turnoId: data.turnoId,
      adjuntoId: adjunto._id.toString(),
    });

    return adjunto;
  }

  // ============================
  // LISTAR ADJUNTOS POR TURNO
  // ============================
  async listarPorTurno(turnoId: string) {
  if (!Types.ObjectId.isValid(turnoId)) return [];

  return this.adjuntoModel
    .find({ turnoId })
    .sort({ createdAt: 1 })
    .lean();
}



  // ============================
  // 🔒 OBTENER ADJUNTO PARA DESCARGA
  // ============================
  async obtenerAdjuntoParaDescarga(id: string) {
    const adjunto = await this.adjuntoModel.findById(id);

    if (!adjunto) {
      throw new NotFoundException('Adjunto no encontrado');
    }

    if (
      adjunto.tipo !== AdjuntoTipo.PDF_FINAL ||
      adjunto.estado !== AdjuntoEstado.FINAL
    ) {
      throw new ForbiddenException(
        'El archivo no está disponible para descarga',
      );
    }

    return adjunto;
  }
}
