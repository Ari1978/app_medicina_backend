// src/superadmin/superadmin.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';

import { Admin } from '../admin/schemas/admin.schema';
import { StaffUser } from '../staff-user/staff-user.schema';
import { EmpresaPrecargada } from '../empresa/schemas/empresaPrecargada.schema';
import { Empresa } from '../empresa/schemas/empresa.schema';
import { Localidad } from '../zona-geografica/schemas/localidad.schema';
import { PerfilExamen } from '../perfil-examen/schemas/perfil-examen.schema';

import { EmpresaService } from '../empresa/empresa.service';
import { logger } from '../logger/winston.logger';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly jwt: JwtService,
    private readonly empresaService: EmpresaService,

    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,

    @InjectModel(StaffUser.name)
    private readonly staffModel: Model<StaffUser>,

    @InjectModel(EmpresaPrecargada.name)
    private readonly empresaPrecargadaModel: Model<EmpresaPrecargada>,

    @InjectModel(Empresa.name)
    private readonly empresaFinalModel: Model<Empresa>,

    @InjectModel(Localidad.name)
    private readonly localidadModel: Model<Localidad>,

    @InjectModel(PerfilExamen.name)
    private readonly perfilExamenModel: Model<PerfilExamen>,
  ) {}

  // ============================================================
  // LOGIN SUPERADMIN
  // ============================================================
  async login(username: string, password: string) {
    try {
      const superAdmin = await this.adminModel.findOne({
        username,
        role: 'superadmin',
      });

      if (!superAdmin) {
        logger.warn(
          `Login superadmin falló (no existe) | username=${username}`,
          { context: 'SuperAdminService' },
        );
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const ok = await bcrypt.compare(password, superAdmin.password);
      if (!ok) {
        logger.warn(
          `Login superadmin falló (password incorrecto) | username=${username}`,
          { context: 'SuperAdminService' },
        );
        throw new UnauthorizedException('Contraseña incorrecta');
      }

      const token = this.jwt.sign({
        id: superAdmin._id,
        role: 'superadmin',
      });

      logger.info(
        `Login superadmin exitoso | id=${superAdmin._id}`,
        { context: 'SuperAdminService' },
      );

      return { superAdmin, token };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error en login superadmin | username=${username} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ADMIN CRUD
  // ============================================================
  async crearAdmin(username: string, password: string) {
    try {
      const hashed = await bcrypt.hash(password, 10);

      const admin = await this.adminModel.create({
        username,
        password: hashed,
        role: 'admin',
        permisos: [],
      });

      logger.info(
        `Admin creado por superadmin | id=${admin._id}`,
        { context: 'SuperAdminService' },
      );

      return admin;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al crear admin | username=${username} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  listarAdmins() {
    return this.adminModel.find({ role: 'admin' });
  }

  async editarAdmin(id: string, data: { username?: string; password?: string }) {
    try {
      const updateData: any = {};
      if (data.username) updateData.username = data.username;
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      const admin = await this.adminModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!admin) throw new NotFoundException('Admin no encontrado');

      logger.info(
        `Admin editado | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Admin actualizado correctamente', admin };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al editar admin | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  async resetAdminPassword(id: string, password: string) {
    try {
      const admin = await this.adminModel.findById(id);
      if (!admin) throw new NotFoundException('Admin no encontrado');

      admin.password = await bcrypt.hash(password, 10);
      await admin.save();

      logger.info(
        `Password admin reseteado | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Contraseña reseteada correctamente' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al resetear password admin | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  async eliminarAdmin(id: string) {
    try {
      const deleted = await this.adminModel.findByIdAndDelete(id);
      if (!deleted) throw new NotFoundException('Admin no encontrado');

      logger.info(
        `Admin eliminado | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Admin eliminado' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al eliminar admin | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  permisosAdmin(id: string, permisos: string[]) {
    return this.adminModel.findByIdAndUpdate(id, { permisos }, { new: true });
  }

  // ============================================================
  // STAFF CRUD
  // ============================================================
  async crearStaff(username: string, password: string) {
    try {
      const hashed = await bcrypt.hash(password, 10);

      const staff = await this.staffModel.create({
        username,
        password: hashed,
        permisos: [],
      });

      logger.info(
        `Staff creado por superadmin | id=${staff._id}`,
        { context: 'SuperAdminService' },
      );

      return staff;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al crear staff | username=${username} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  listarStaff() {
    return this.staffModel.find();
  }

  async editarStaff(id: string, data: { username?: string; password?: string }) {
    try {
      const updateData: any = {};
      if (data.username) updateData.username = data.username;
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      const staff = await this.staffModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!staff) throw new NotFoundException('Staff no encontrado');

      logger.info(
        `Staff editado | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Staff actualizado correctamente', staff };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al editar staff | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  async resetStaffPassword(id: string, password: string) {
    try {
      const staff = await this.staffModel.findById(id);
      if (!staff) throw new NotFoundException('Staff no encontrado');

      staff.password = await bcrypt.hash(password, 10);
      await staff.save();

      logger.info(
        `Password staff reseteado | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Contraseña reseteada correctamente' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al resetear password staff | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  async eliminarStaff(id: string) {
    try {
      const deleted = await this.staffModel.findByIdAndDelete(id);
      if (!deleted) throw new NotFoundException('Staff no encontrado');

      logger.info(
        `Staff eliminado | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Staff eliminado' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al eliminar staff | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  permisosStaff(id: string, permisos: string[]) {
    return this.staffModel.findByIdAndUpdate(id, { permisos }, { new: true });
  }

  // ============================================================
  // EMPRESAS PRECARGADAS
  // ============================================================
  crearEmpresaPrecargada(data: { cuit: string; razonSocial: string }) {
    return this.empresaPrecargadaModel.create({
      cuit: data.cuit,
      razonSocial: data.razonSocial,
      habilitado: true,
    });
  }

  listarEmpresasPrecargadas() {
    return this.empresaPrecargadaModel.find();
  }

  // ============================================================
  // EMPRESAS FINALES
  // ============================================================
  listarEmpresasFinales() {
    return this.empresaFinalModel.find();
  }

  async editarEmpresaFinal(id: string, data: any) {
    try {
      const empresa = await this.empresaFinalModel.findByIdAndUpdate(id, data, {
        new: true,
      });

      if (!empresa) throw new NotFoundException('Empresa no encontrada');

      logger.info(
        `Empresa final editada | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Empresa actualizada', empresa };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al editar empresa final | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  async resetPasswordEmpresaFinal(id: string, password: string) {
    try {
      const empresa = await this.empresaFinalModel.findById(id);
      if (!empresa) throw new NotFoundException('Empresa no encontrada');

      empresa.password = await bcrypt.hash(password, 10);
      await empresa.save();

      logger.info(
        `Password empresa reseteado | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Contraseña reseteada correctamente' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al resetear password empresa | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  async eliminarEmpresaFinal(id: string) {
    try {
      const empresa = await this.empresaFinalModel.findByIdAndDelete(id);
      if (!empresa) throw new NotFoundException('Empresa no encontrada');

      logger.info(
        `Empresa final eliminada | id=${id}`,
        { context: 'SuperAdminService' },
      );

      return { message: 'Empresa eliminada' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al eliminar empresa final | id=${id} | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // IMPORTAR EMPRESAS EXCEL
  // ============================================================
  async importarEmpresas(file: Express.Multer.File) {
    try {
      if (!file) throw new BadRequestException('Archivo requerido');

      logger.info(
        `Archivo Excel recibido | name=${file.originalname}`,
        { context: 'SuperAdminService' },
      );

      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let insertadas = 0;
      let omitidas = 0;

      for (const row of rows as any[]) {
        const cuit = String(row['cuit '] || row.cuit || '').trim();
        const razonSocial = String(row.razonSocial || '').trim();
        const email1 = String(row.email || row.email1 || '').trim();

        if (!cuit || !razonSocial || !email1) {
          omitidas++;
          continue;
        }

        const existe = await this.empresaService.findByCuit(cuit);
        if (existe) {
          omitidas++;
          continue;
        }

        await this.empresaService.createFromImport({
          cuit,
          razonSocial,
          email1,
        });

        insertadas++;
      }

      logger.info(
        `Importación Excel finalizada | insertadas=${insertadas} | omitidas=${omitidas}`,
        { context: 'SuperAdminService' },
      );

      return {
        message: 'Importación finalizada correctamente',
        insertadas,
        omitidas,
        total: rows.length,
      };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error en importación Excel | ${err.message}`,
        { context: 'SuperAdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // PERFILES DE EXAMEN
  // ============================================================
  crearPerfilExamen(data: {
    empresaId: string;
    puesto: string;
    estudios: { nombre: string; sector: string }[];
  }) {
    return this.perfilExamenModel.create({
      empresa: data.empresaId,
      nombre: data.puesto,
      estudios: data.estudios,
    });
  }

  listarPerfilesEmpresa(empresaId: string) {
    return this.perfilExamenModel.find({ empresa: empresaId });
  }

  async editarPerfilExamen(id: string, data: any) {
    const perfil = await this.perfilExamenModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!perfil) throw new NotFoundException('Perfil no encontrado');
    return perfil;
  }

  async eliminarPerfilExamen(id: string) {
    const perfil = await this.perfilExamenModel.findByIdAndDelete(id);
    if (!perfil) throw new NotFoundException('Perfil no encontrado');
    return { message: 'Perfil eliminado' };
  }

  // ============================================================
  // STATS
  // ============================================================
  async getStats() {
    const empresas = await this.empresaFinalModel.countDocuments();
    const empresasActivas = await this.empresaFinalModel.countDocuments({
      activo: true,
    });
    const empresasInactivas = empresas - empresasActivas;

    const admins = await this.adminModel.countDocuments({ role: 'admin' });
    const staff = await this.staffModel.countDocuments();
    const localidades = await this.localidadModel.countDocuments();

    return {
      empresasTotal: empresas,
      empresasActivas,
      empresasInactivas,
      admins,
      staff,
      localidades,
    };
  }
}
