import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Paciente, PacienteDocument } from './schemas/paciente.schema';

@Injectable()
export class PacientesService {
  constructor(
    @InjectModel(Paciente.name)
    private readonly pacienteModel: Model<PacienteDocument>,
  ) {}

  // =========================
  // EDITAR PACIENTE
  // =========================
  async editarPaciente(id: string, data: any) {
    const paciente = await this.pacienteModel.findById(id);

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // 🔒 Validar DNI duplicado (si se modifica)
    if (data.dni && data.dni !== paciente.dni) {
      const existe = await this.pacienteModel.findOne({
        dni: data.dni,
        _id: { $ne: id },
      });

      if (existe) {
        throw new BadRequestException('DNI duplicado');
      }
    }

    Object.assign(paciente, data);
    await paciente.save();

    return {
      message: 'Paciente actualizado correctamente',
      paciente,
    };
  }
}
