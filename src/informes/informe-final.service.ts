import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AdjuntoPractica,
  AdjuntoPracticaDocument,
  AdjuntoEstado,
  AdjuntoTipo,
} from '../adjuntos/schemas/adjunto-practica.schema';

import { calcularHashArchivo } from '../common/utils/file-hash.util';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AuditoriaEvento } from '../auditoria/auditoria.evento';

@Injectable()
export class InformeFinalService {
  constructor(
    @InjectModel(AdjuntoPractica.name)
    private readonly adjuntoModel: Model<AdjuntoPracticaDocument>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /**
   * Cierra un informe médico y lo vuelve INMUTABLE
   */
  async cerrarInformeFinal(params: {
    adjuntoId: string;
    usuarioId: string;
    rol: string;
  }) {
    const adjunto = await this.adjuntoModel.findById(params.adjuntoId);

    if (!adjunto) {
      throw new NotFoundException('Adjunto no encontrado');
    }

    if (adjunto.tipo !== AdjuntoTipo.PDF) {
      throw new BadRequestException(
        'Solo se puede cerrar un PDF clínico',
      );
    }

    if (adjunto.estado === AdjuntoEstado.FINAL) {
      throw new BadRequestException(
        'El informe ya está cerrado',
      );
    }

    // 🔐 Hash de integridad
    const hash = calcularHashArchivo(adjunto.path);

    // 🧱 Cierre legal
    adjunto.estado = AdjuntoEstado.FINAL;
    adjunto.tipo = AdjuntoTipo.PDF_FINAL;
    adjunto.hash = hash;
    adjunto.cerradoAt = new Date();
    adjunto.cerradoPor = params.usuarioId;
    adjunto.version += 1;

    await adjunto.save();

    // 🧾 AUDITORÍA
    await this.auditoriaService.registrar({
      evento: AuditoriaEvento.CIERRA_INFORME,
      usuarioId: params.usuarioId,
      rol: params.rol,
      adjuntoId: adjunto._id.toString(),
      turnoId: adjunto.turnoId.toString(),
    });

    return {
      ok: true,
      hash,
      version: adjunto.version,
    };
  }
}
