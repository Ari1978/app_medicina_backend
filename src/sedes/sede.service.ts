
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Sede, SedeDocument } from './schema/sede.schema';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Injectable()
export class SedeService {
  constructor(
    @InjectModel(Sede.name)
    private readonly sedeModel: Model<SedeDocument>,
  ) {}

  async crear(dto: CreateSedeDto) {
    return this.sedeModel.create(dto);
  }

  async listar() {
    return this.sedeModel.find().sort({ nombre: 1 });
  }

  async editar(id: string, dto: UpdateSedeDto) {
    const sede = await this.sedeModel.findByIdAndUpdate(id, dto, { new: true });

    if (!sede) throw new NotFoundException('Sede no encontrada');

    return sede;
  }

  async eliminar(id: string) {
    const sede = await this.sedeModel.findById(id);
    if (!sede) throw new NotFoundException('Sede no encontrada');

    await sede.deleteOne();
    return { message: 'Sede eliminada' };
  }
}
