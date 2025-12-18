// src/formularios/formulario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Formulario, FormularioDocument } from './formulario.schema';
import { logger } from '../logger/winston.logger';

@Injectable()
export class FormulariosService {
  constructor(
    @InjectModel(Formulario.name)
    private readonly model: Model<FormularioDocument>,
  ) {}

  // =============================
  // CREAR FORMULARIO
  // =============================
  async crear(
    empresaId: string,
    tipo: string,
    datos: any,
    archivo?: Express.Multer.File,
  ) {
    try {
      const form = await this.model.create({
        empresa: empresaId,
        tipo,
        datos,
        estado: 'pendiente',
        archivo: archivo?.filename || null,
      });

      logger.info(
        `Formulario creado | tipo=${tipo} | empresa=${empresaId} | id=${form._id}`,
        { context: 'FormulariosService' },
      );

      return form;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Error desconocido');

      logger.error(
        `Error al crear formulario | tipo=${tipo} | empresa=${empresaId} | ${err.message}`,
        { context: 'FormulariosService' },
      );

      throw err;
    }
  }

  // =============================
  // LISTAR PENDIENTES
  // =============================
  async listarPendientes() {
    try {
      return await this.model
        .find({ estado: 'pendiente' })
        .sort({ createdAt: -1 });
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Error desconocido');

      logger.error(
        `Error al listar formularios pendientes | ${err.message}`,
        { context: 'FormulariosService' },
      );

      throw err;
    }
  }

  // =============================
  // BUSCAR POR ID
  // =============================
  async buscarPorId(id: string) {
    try {
      const form = await this.model.findById(id);

      if (!form) {
        logger.warn(
          `Formulario no encontrado | id=${id}`,
          { context: 'FormulariosService' },
        );
      }

      return form;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Error desconocido');

      logger.error(
        `Error al buscar formulario | id=${id} | ${err.message}`,
        { context: 'FormulariosService' },
      );

      throw err;
    }
  }

  // =============================
  // RESPONDER FORMULARIO
  // =============================
  async responder(id: string, respuesta: string) {
    try {
      const form = await this.model.findById(id);
      if (!form) {
        logger.warn(
          `Responder formulario falló (no existe) | id=${id}`,
          { context: 'FormulariosService' },
        );
        throw new NotFoundException('Formulario no encontrado');
      }

      form.respuestaStaff = respuesta;
      form.estado = 'en_progreso';

      await form.save();

      logger.info(
        `Formulario respondido | id=${id}`,
        { context: 'FormulariosService' },
      );

      return form;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Error desconocido');

      logger.error(
        `Error al responder formulario | id=${id} | ${err.message}`,
        { context: 'FormulariosService' },
      );

      throw err;
    }
  }

  // =============================
  // RESOLVER FORMULARIO
  // =============================
  async resolver(id: string) {
    try {
      const form = await this.model.findById(id);
      if (!form) {
        logger.warn(
          `Resolver formulario falló (no existe) | id=${id}`,
          { context: 'FormulariosService' },
        );
        throw new NotFoundException('Formulario no encontrado');
      }

      form.estado = 'resuelto';
      await form.save();

      logger.info(
        `Formulario resuelto | id=${id}`,
        { context: 'FormulariosService' },
      );

      return form;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Error desconocido');

      logger.error(
        `Error al resolver formulario | id=${id} | ${err.message}`,
        { context: 'FormulariosService' },
      );

      throw err;
    }
  }

  // =============================
  // LISTAR POR TIPO
  // =============================
  async listarPorTipo(tipo: string) {
    try {
      return await this.model
        .find({ tipo })
        .sort({ createdAt: -1 });
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Error desconocido');

      logger.error(
        `Error al listar formularios por tipo | tipo=${tipo} | ${err.message}`,
        { context: 'FormulariosService' },
      );

      throw err;
    }
  }

  // =============================
  // MARCAR PRESUPUESTADO
  // =============================
  async marcarPresupuestado(id: string) {
    try {
      const form = await this.model.findById(id);
      if (!form) {
        logger.warn(
          `Marcar presupuestado falló (no existe) | id=${id}`,
          { context: 'FormulariosService' },
        );
        throw new NotFoundException('Formulario no encontrado');
      }

      form.estado = 'presupuestado';
      await form.save();

      logger.info(
        `Formulario marcado como presupuestado | id=${id}`,
        { context: 'FormulariosService' },
      );

      return form;
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error('Error desconocido');

      logger.error(
        `Error al marcar presupuestado | id=${id} | ${err.message}`,
        { context: 'FormulariosService' },
      );

      throw err;
    }
  }
}
