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
  // LOGIN EMPRESA (LÓGICA CENTRALIZADA)
  // ------------------------------------------------------------
  async loginEmpresa(cuit: string, password: string) {
    try {
      const empresa = await this.findByCuit(cuit);

      if (!empresa) {
        throw new NotFoundException('CUIT incorrecto');
      }

      const ok = await bcrypt.compare(password, empresa.password);
      if (!ok) {
        throw new BadRequestException('Password incorrecto');
      }

      return empresa;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error en login empresa | cuit=${cuit} | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }

  // ------------------------------------------------------------
  // FINDERS
  // ------------------------------------------------------------
  async findById(id: string) {
    try {
      return await this.empresaModel.findById(id);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al buscar empresa por id | id=${id} | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }

  async findByEmail1(email1: string) {
    try {
      return await this.empresaModel.findOne({ email1 });
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al buscar empresa por email | email=${email1} | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }

  async findByCuit(cuit: string) {
    try {
      return await this.empresaModel.findOne({ cuit });
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al buscar empresa por CUIT | cuit=${cuit} | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }

  // ------------------------------------------------------------
  // RESET PASSWORD
  // ------------------------------------------------------------
  async resetPassword(id: string, password: string) {
    try {
      const empresa = await this.empresaModel.findById(id);
      if (!empresa) {
        logger.warn(
          `Reset password falló (empresa no existe) | id=${id}`,
          { context: 'EmpresaService' },
        );
        throw new NotFoundException('Empresa no encontrada');
      }

      empresa.password = await bcrypt.hash(password, 10);
      empresa.mustChangePassword = false;
      await empresa.save();

      logger.info(
        `Password reseteado | empresa=${id}`,
        { context: 'EmpresaService' },
      );

      return { message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al resetear password | empresa=${id} | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }

  // ------------------------------------------------------------
  // LISTAR
  // ------------------------------------------------------------
  async findAll() {
    try {
      return await this.empresaModel
        .find({ activo: true })
        .select('_id razonSocial numeroCliente');
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al listar empresas | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }

  async buscarEmpresas(query: string) {
    try {
      if (!query) return [];

      return await this.empresaModel
        .find({
          razonSocial: { $regex: query, $options: 'i' },
          activo: true,
        })
        .limit(10)
        .select('_id razonSocial numeroCliente');
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al buscar empresas | query=${query} | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }

  // ------------------------------------------------------------
  // ASIGNAR NÚMERO DE CLIENTE
  // ------------------------------------------------------------
  private async generarNumeroCliente(): Promise<number> {
    try {
      const last = await this.empresaModel
        .findOne({}, { numeroCliente: 1 })
        .sort({ numeroCliente: -1 });

      return last?.numeroCliente ? last.numeroCliente + 1 : 1001;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al generar número de cliente | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }

  // ------------------------------------------------------------
  // CREACIÓN DESDE IMPORTACIÓN EXCEL
  // ------------------------------------------------------------
  async createFromImport(data: {
    cuit: string;
    razonSocial: string;
    email1: string;
  }) {
    try {
      const numeroCliente = await this.generarNumeroCliente();

      const passwordPlano = 'empresa123';
      const hashed = await bcrypt.hash(passwordPlano, 10);

      const empresa = await this.empresaModel.create({
        ...data,
        numeroCliente,
        password: hashed,
        mustChangePassword: true,
        activo: true,
        role: 'empresa',
      });

      logger.info(
        `Empresa creada desde import | id=${empresa._id} | cuit=${data.cuit}`,
        { context: 'EmpresaService' },
      );

      return empresa;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al crear empresa desde import | cuit=${data.cuit} | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
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
    try {
      const existe = await this.findByCuit(data.cuit);
      if (existe) {
        logger.warn(
          `Intento de crear empresa duplicada | cuit=${data.cuit}`,
          { context: 'EmpresaService' },
        );
        throw new BadRequestException('Ya existe una empresa con ese CUIT');
      }

      const numeroCliente = await this.generarNumeroCliente();
      const hashed = await bcrypt.hash(data.password ?? 'empresa123', 10);

      const empresa = await this.empresaModel.create({
        ...data,
        numeroCliente,
        password: hashed,
        mustChangePassword: !data.password,
        activo: true,
        role: 'empresa',
      });

      logger.info(
        `Empresa creada desde admin | id=${empresa._id} | cuit=${data.cuit}`,
        { context: 'EmpresaService' },
      );

      return empresa;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al crear empresa desde admin | cuit=${data.cuit} | ${err.message}`,
        { context: 'EmpresaService' },
      );

      throw err;
    }
  }
}
