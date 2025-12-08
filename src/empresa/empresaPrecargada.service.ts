import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmpresaPrecargada } from './schemas/empresaPrecargada.schema';

@Injectable()
export class EmpresaPrecargadaService {
  constructor(
    @InjectModel(EmpresaPrecargada.name)
    private empresaModel: Model<EmpresaPrecargada>,
  ) {}

  async create(cuit: string, razonSocial: string) {
    const exists = await this.empresaModel.findOne({ cuit });
    if (exists) throw new Error('La empresa ya está precargada');

    return this.empresaModel.create({
      cuit,
      razonSocial,
      habilitada: true,
    });
  }

  async findByCuit(cuit: string) {
    return this.empresaModel.findOne({ cuit });
  }

  async getAll() {
    return this.empresaModel.find();
  }
}
