import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Empresa } from './schemas/empresa.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectModel(Empresa.name) private empresaModel: Model<Empresa>,
  ) {}

  // ------------------------------------------------------------
  // ❌ REGISTRO PÚBLICO ELIMINADO
  // ------------------------------------------------------------
  // Las empresas ya NO se registran solas.
  // Solo entran por:
  // - Importación Excel
  // - SuperAdmin
  // - Precarga manual

  // ------------------------------------------------------------
  // FINDERS
  // ------------------------------------------------------------
  async findById(id: string) {
    return this.empresaModel.findById(id);
  }

  async findByEmail1(email1: string) {
    return this.empresaModel.findOne({ email1 });
  }

  async findByCuit(cuit: string) {
    return this.empresaModel.findOne({ cuit });
  }

  // ------------------------------------------------------------
  // CAMBIO / RESET DE PASSWORD (DESACTIVA MUSTCHANGE)
  // ------------------------------------------------------------
 async resetPassword(id: string, password: string) {
  const empresa = await this.empresaModel.findById(id);
  if (!empresa) throw new NotFoundException('Empresa no encontrada');

  empresa.password = await bcrypt.hash(password, 10);
  empresa.mustChangePassword = false; // ✅ AHORA SÍ SE LIBERA EL BLOQUEO
  await empresa.save();

  return { message: 'Contraseña actualizada correctamente' };
}


  // ------------------------------------------------------------
  // LISTAR
  // ------------------------------------------------------------
  async findAll() {
    return this.empresaModel.find({ activo: true }).select('_id razonSocial');
  }

  async buscarEmpresas(query: string) {
    if (!query) return [];

    return this.empresaModel
      .find({
        razonSocial: { $regex: query, $options: 'i' },
        activo: true,
      })
      .limit(10)
      .select('_id razonSocial');
  }

  // ------------------------------------------------------------
  // ✅ IMPORTACIÓN DESDE EXCEL / CSV (SISTEMA PROFESIONAL)
  // ------------------------------------------------------------
  async createFromImport(data: {
    cuit: string;
    razonSocial: string;
    email1: string;
  }) {
    const passwordPlano = 'empresa123';
    const hashed = await bcrypt.hash(passwordPlano, 10);

    return this.empresaModel.create({
      ...data,
      password: hashed,
      mustChangePassword: true, // ✅ OBLIGA CAMBIO AL PRIMER INGRESO
      activo: true,
      role: 'empresa',
    });
  }
}
