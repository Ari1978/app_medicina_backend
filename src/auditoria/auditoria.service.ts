import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Auditoria,
  AuditoriaDocument,
} from './schema/auditoria.schema';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectModel(Auditoria.name)
    private readonly auditoriaModel: Model<AuditoriaDocument>,
  ) {}

  async registrar(params: {
    evento: string;
    usuarioId: string;
    rol: string;
    turnoId?: string;
    adjuntoId?: string;
    detalle?: string;
  }) {
    return this.auditoriaModel.create(params);
  }
}
