import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Empresa } from './schemas/empresa.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { logger } from '../logger/winston.logger';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectModel(Empresa.name)
    private readonly empresaModel: Model<Empresa>,
  ) {}

  // ------------------------------------------------------------
  // VALIDAR LOGIN EMPRESA (SOLO LÓGICA)
  // ------------------------------------------------------------
  async validarCredenciales(cuit: string, password: string) {
    const empresa = await this.empresaModel.findOne({ cuit });
    if (!empresa) {
      throw new NotFoundException('CUIT incorrecto');
    }

    const ok = await bcrypt.compare(password, empresa.password);
    if (!ok) {
      throw new BadRequestException('Password incorrecto');
    }

    return empresa;
  }

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
  // RESET PASSWORD
  // ------------------------------------------------------------
  async resetPassword(id: string, password: string) {
    const empresa = await this.empresaModel.findById(id);
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    empresa.password = await bcrypt.hash(password, 10);
    empresa.mustChangePassword = false;
    await empresa.save();

    logger.info(`Password reseteado | empresa=${id}`, {
      context: 'EmpresaService',
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  // ------------------------------------------------------------
  // LISTAR
  // ------------------------------------------------------------
  async findAll() {
    return this.empresaModel
      .find({ activo: true })
      .select('_id razonSocial numeroCliente');
  }

  async buscarEmpresas(query: string) {
    if (!query) return [];

    return this.empresaModel
      .find({
        razonSocial: { $regex: query, $options: 'i' },
        activo: true,
      })
      .limit(10)
      .select('_id razonSocial numeroCliente');
  }

  // ------------------------------------------------------------
  // ASIGNAR NÚMERO DE CLIENTE
  // ------------------------------------------------------------
  private async generarNumeroCliente(): Promise<number> {
    const last = await this.empresaModel
      .findOne({}, { numeroCliente: 1 })
      .sort({ numeroCliente: -1 });

    return last?.numeroCliente ? last.numeroCliente + 1 : 1001;
  }

  // ------------------------------------------------------------
  // CREACIÓN DESDE IMPORTACIÓN EXCEL
  // ------------------------------------------------------------
  async createFromImport(data: {
    cuit: string;
    razonSocial: string;
    email1: string;
  }) {
    const numeroCliente = await this.generarNumeroCliente();
    const hashed = await bcrypt.hash('empresa123', 10);

    return this.empresaModel.create({
      ...data,
      numeroCliente,
      password: hashed,
      mustChangePassword: true,
      activo: true,
      role: 'empresa',
    });
  }

  // ------------------------------------------------------------
  // CREACIÓN MANUAL DESDE SUPERADMIN
  // ------------------------------------------------------------
  async createFromAdmin(data: {
    cuit: string;
    razonSocial: string;
    email1: string;
    password?: string;
  }) {
    const existe = await this.findByCuit(data.cuit);
    if (existe) {
      throw new BadRequestException('Ya existe una empresa con ese CUIT');
    }

    const numeroCliente = await this.generarNumeroCliente();
    const hashed = await bcrypt.hash(data.password ?? 'empresa123', 10);

    return this.empresaModel.create({
      ...data,
      numeroCliente,
      password: hashed,
      mustChangePassword: !data.password,
      activo: true,
      role: 'empresa',
    });
  }
}
