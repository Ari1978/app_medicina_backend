import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  PreInforme,
  PreInformeDocument,
} from './schema/pre-informe.schema';

@Injectable()
export class PreInformesService {
  constructor(
    @InjectModel(PreInforme.name)
    private readonly preInformeModel: Model<PreInformeDocument>,
  ) {}

  // Crear o actualizar (upsert)
  async guardarPreInforme(params: {
    turnoId: string;
    textoPorPractica: any[];
    observacionGeneral?: string;
    usuarioId: string;
  }) {
    return this.preInformeModel.findOneAndUpdate(
      { turnoId: new Types.ObjectId(params.turnoId) },
      {
        turnoId: new Types.ObjectId(params.turnoId),
        textoPorPractica: params.textoPorPractica,
        observacionGeneral: params.observacionGeneral,
        creadoPor: params.usuarioId,
        estado: 'borrador',
      },
      { upsert: true, new: true },
    );
  }

  async obtenerPorTurno(turnoId: string) {
    const preInforme =
      await this.preInformeModel.findOne({
        turnoId: new Types.ObjectId(turnoId),
      });

    if (!preInforme) {
      throw new NotFoundException(
        'Pre-informe no encontrado',
      );
    }

    return preInforme;
  }
}
