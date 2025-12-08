
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Formulario, FormularioDocument } from './formulario.schema';

@Injectable()
export class FormulariosService {
  constructor(
    @InjectModel(Formulario.name)
    private readonly model: Model<FormularioDocument>,
  ) {}

  crear(empresaId: string, tipo: string, datos: any) {
    return this.model.create({
      empresa: empresaId,
      tipo,
      datos,
      estado: 'pendiente',
    });
  }

  listarPendientes() {
    return this.model.find({ estado: 'pendiente' }).sort({ createdAt: -1 });
  }

  buscarPorId(id: string) {
    return this.model.findById(id);
  }

  async responder(id: string, respuesta: string) {
    const form = await this.model.findById(id);
    if (!form) throw new NotFoundException('Formulario no encontrado');

    form.respuestaStaff = respuesta;
    form.estado = 'en_progreso';
    return form.save();
  }

  async resolver(id: string) {
    const form = await this.model.findById(id);
    if (!form) throw new NotFoundException('Formulario no encontrado');

    form.estado = 'resuelto';
    return form.save();
  }
}
