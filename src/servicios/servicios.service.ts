import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  ServicioArchivo,
  ServicioArchivoDocument,
} from './schemas/servicio-archivo.schema';

@Injectable()
export class ServicioArchivoService {
  constructor(
    @InjectModel(ServicioArchivo.name)
    private readonly model: Model<ServicioArchivoDocument>,
  ) {}

  // =====================================================
  // CREAR
  // =====================================================
  async crear(data: {
    servicioId: string;
    area: string;
    original: string;
    preview?: string;
    filename: string;
    mimeType: string;
    size: number;
    categoria: string;
  }) {
    if (!Types.ObjectId.isValid(data.servicioId)) {
      throw new BadRequestException('servicioId inválido');
    }

    return this.model.create({
      servicioId: new Types.ObjectId(data.servicioId),
      area: data.area,
      original: data.original,
      preview: data.preview,
      filename: data.filename,
      mimeType: data.mimeType,
      size: data.size,
      categoria: data.categoria,
    });
  }

  // =====================================================
  // LISTAR POR SERVICIO + ÁREAS (ÚNICO)
  // =====================================================
  listarPorServicioYAreas(
    servicioId: string,
    areas: string[],
  ) {
    if (!Types.ObjectId.isValid(servicioId)) {
      throw new BadRequestException('servicioId inválido');
    }

    return this.model
      .find({
        servicioId: new Types.ObjectId(servicioId),
        area: { $in: areas },
        eliminado: false,
      })
      .sort({ createdAt: -1 });
  }

  // =====================================================
  // OBTENER UNO
  // =====================================================
  obtenerPorId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('id inválido');
    }
    return this.model.findById(id);
  }

  // =====================================================
  // SOFT DELETE
  // =====================================================
  eliminar(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('id inválido');
    }

    return this.model.findByIdAndUpdate(
      id,
      { eliminado: true },
      { new: true },
    );
  }

  
}
