// src/admin/admin.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { Admin } from './schemas/admin.schema';
import { Staff } from '../staff/schemas/staff.schema';
import { signAdminToken } from './admin.jwt';

import { logger } from '../logger/winston.logger';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
  ) {}

  // ============================================================
  // ✔ OBTENER TODOS LOS ADMINS (sin passwords)
  // ============================================================
  async getAll() {
    try {
      return await this.adminModel.find().select('-password');
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al listar admins | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ CREAR ADMIN
  // ============================================================
  async create(username: string, password: string) {
    try {
      const exists = await this.adminModel.findOne({ username });
      if (exists) {
        logger.warn(
          `Intento de crear admin duplicado | username=${username}`,
          { context: 'AdminService' },
        );
        throw new Error('Ese admin ya existe');
      }

      const hashed = await bcrypt.hash(password, 10);

      const admin = await this.adminModel.create({
        username,
        password: hashed,
        role: 'admin',
      });

      logger.info(
        `Admin creado | id=${admin._id} | username=${username}`,
        { context: 'AdminService' },
      );

      return {
        message: 'Admin creado',
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
        },
      };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al crear admin | username=${username} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ LOGIN
  // ============================================================
  async validateLogin(username: string, password: string) {
    try {
      const admin = await this.adminModel.findOne({ username });
      if (!admin) {
        logger.warn(
          `Login admin falló (no existe) | username=${username}`,
          { context: 'AdminService' },
        );
        throw new Error('Usuario no encontrado');
      }

      const ok = await bcrypt.compare(password, admin.password);
      if (!ok) {
        logger.warn(
          `Login admin falló (password incorrecto) | username=${username}`,
          { context: 'AdminService' },
        );
        throw new Error('Credenciales inválidas');
      }

      const token = signAdminToken({
        id: admin._id,
        role: admin.role,
        username: admin.username,
      });

      logger.info(
        `Login admin exitoso | id=${admin._id} | username=${username}`,
        { context: 'AdminService' },
      );

      return { admin, token };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error en login admin | username=${username} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ ME
  // ============================================================
  async me(id: string) {
    try {
      return await this.adminModel.findById(id).select('-password');
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al obtener admin | id=${id} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ ACTUALIZAR ADMIN
  // ============================================================
  async update(id: string, data: { username?: string; password?: string }) {
    try {
      const updateData: any = {};

      if (data.username) updateData.username = data.username;
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      const admin = await this.adminModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!admin) {
        logger.warn(
          `Actualizar admin falló (no existe) | id=${id}`,
          { context: 'AdminService' },
        );
        throw new NotFoundException('Admin no encontrado');
      }

      logger.info(
        `Admin actualizado | id=${id}`,
        { context: 'AdminService' },
      );

      return {
        message: 'Admin actualizado correctamente',
        admin,
      };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al actualizar admin | id=${id} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ ELIMINAR ADMIN
  // ============================================================
  async delete(id: string) {
    try {
      const admin = await this.adminModel.findByIdAndDelete(id);
      if (!admin) {
        logger.warn(
          `Eliminar admin falló (no existe) | id=${id}`,
          { context: 'AdminService' },
        );
        throw new NotFoundException('Admin no encontrado');
      }

      logger.info(
        `Admin eliminado | id=${id}`,
        { context: 'AdminService' },
      );

      return { message: 'Admin eliminado' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al eliminar admin | id=${id} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ ASIGNAR PERMISOS A STAFF
  // ============================================================
  async asignarPermisosAStaff(staffId: string, permisos: string[]) {
    try {
      const staff = await this.staffModel.findById(staffId);

      if (!staff) {
        logger.warn(
          `Asignar permisos falló (staff no existe) | id=${staffId}`,
          { context: 'AdminService' },
        );
        throw new NotFoundException('Staff no encontrado');
      }

      if (staff.role !== 'staff') {
        throw new ForbiddenException(
          'Solo se pueden asignar permisos a Staff',
        );
      }

      staff.permisos = permisos;
      await staff.save();

      logger.info(
        `Permisos asignados a staff | id=${staffId}`,
        { context: 'AdminService' },
      );

      return staff;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al asignar permisos a staff | id=${staffId} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ EDITAR STAFF
  // ============================================================
  async editarStaff(id: string, data: Partial<Staff>) {
    try {
      const staff = await this.staffModel.findByIdAndUpdate(id, data, {
        new: true,
      });

      if (!staff) {
        logger.warn(
          `Editar staff falló (no existe) | id=${id}`,
          { context: 'AdminService' },
        );
        throw new NotFoundException('Staff no encontrado');
      }

      logger.info(
        `Staff editado | id=${id}`,
        { context: 'AdminService' },
      );

      return staff;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al editar staff | id=${id} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ ELIMINAR STAFF
  // ============================================================
  async eliminarStaff(id: string) {
    try {
      const staff = await this.staffModel.findByIdAndDelete(id);
      if (!staff) {
        logger.warn(
          `Eliminar staff falló (no existe) | id=${id}`,
          { context: 'AdminService' },
        );
        throw new NotFoundException('Staff no encontrado');
      }

      logger.info(
        `Staff eliminado | id=${id}`,
        { context: 'AdminService' },
      );

      return { message: 'Staff eliminado' };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al eliminar staff | id=${id} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }

  // ============================================================
  // ✔ CAMBIAR ESTADO STAFF
  // ============================================================
  async cambiarEstadoStaff(id: string, activo: boolean) {
    try {
      const staff = await this.staffModel.findByIdAndUpdate(
        id,
        { activo },
        { new: true },
      );

      if (!staff) {
        logger.warn(
          `Cambiar estado staff falló (no existe) | id=${id}`,
          { context: 'AdminService' },
        );
        throw new NotFoundException('Staff no encontrado');
      }

      logger.info(
        `Estado de staff actualizado | id=${id} | activo=${activo}`,
        { context: 'AdminService' },
      );

      return staff;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al cambiar estado staff | id=${id} | ${err.message}`,
        { context: 'AdminService' },
      );

      throw err;
    }
  }
}
