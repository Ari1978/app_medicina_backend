// src/staff/staff.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Staff } from './schemas/staff.schema';
import { Turno } from '../turno/schema/turno.schema';

import { logger } from '../logger/winston.logger';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name)
    private readonly staffModel: Model<Staff>,

    @InjectModel(Turno.name)
    private readonly turnoModel: Model<Turno>,
  ) {}

  // ============================================================
  // ---------------------- LOGIN STAFF --------------------------
  // ============================================================
  async login(username: string, password: string) {
    try {
      const staff = await this.staffModel.findOne({ username });

      if (!staff) {
        logger.warn(
          `Login staff falló (usuario inexistente) | username=${username}`,
          { context: 'StaffService' },
        );
        throw new UnauthorizedException('Usuario incorrecto');
      }

      const bcrypt = await import('bcryptjs');
      const ok = await bcrypt.compare(password, staff.password);

      if (!ok) {
        logger.warn(
          `Login staff falló (password incorrecto) | username=${username}`,
          { context: 'StaffService' },
        );
        throw new UnauthorizedException('Password incorrecto');
      }

      const payload = {
        id: staff._id.toString(),
        role: staff.role ?? 'staff',
        username: staff.username,
        permisos: Array.isArray(staff.permisos) ? staff.permisos : [],
      };

      const token = this.signStaffToken(payload);

      logger.info(
        `Login staff exitoso | id=${staff._id} | username=${username}`,
        { context: 'StaffService' },
      );

      return {
        message: 'Login staff OK',
        token,
        staff: {
          id: staff._id.toString(),
          username: staff.username,
          role: staff.role ?? 'staff',
          permisos: payload.permisos,
        },
      };
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error en login staff | username=${username} | ${err.message}`,
        { context: 'StaffService' },
      );

      throw err;
    }
  }

  private signStaffToken(payload: any) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
  }

  // ============================================================
  // -------- VER / EDITAR RESULTADOS (LISTADO STAFF) ------------
  // ============================================================
  async buscarResultados(filtros: {
    empresa?: string;
    dni?: string;
    nombre?: string;
  }) {
    try {
      const query: any = {
        resultadoFinal: { $exists: true },
      };

      // Filtro por DNI
      if (filtros.dni) {
        query.empleadoDni = filtros.dni;
      }

      // Filtro por nombre o apellido
      if (filtros.nombre) {
        query.$or = [
          { empleadoNombre: new RegExp(filtros.nombre, 'i') },
          { empleadoApellido: new RegExp(filtros.nombre, 'i') },
        ];
      }

      const turnos = await this.turnoModel
        .find(query)
        .populate('empresa', 'razonSocial')
        .sort({ fecha: -1 });

      // Filtro por empresa (razón social)
      if (filtros.empresa) {
        const empresaFiltro = filtros.empresa.toLowerCase();

        const filtrados = turnos.filter((t: any) =>
          t.empresa?.razonSocial
            ?.toLowerCase()
            .includes(empresaFiltro),
        );

        logger.info(
          `Resultados filtrados por empresa | empresa=${filtros.empresa} | total=${filtrados.length}`,
          { context: 'StaffService' },
        );

        return filtrados;
      }

      logger.info(
        `Resultados listados | total=${turnos.length}`,
        { context: 'StaffService' },
      );

      return turnos;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Error desconocido');

      logger.error(
        `Error al buscar resultados | ${err.message}`,
        { context: 'StaffService' },
      );

      throw err;
    }
  }
}
