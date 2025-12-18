import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PerfilExamen, PerfilExamenDocument } from './schemas/perfil-examen.schema';
import { CreatePerfilExamenDto } from './dto/create-perfil-examen.dto';
import { UpdatePerfilExamenDto } from './dto/update-perfil-examen.dto';

@Injectable()
export class PerfilExamenService {
  constructor(
    @InjectModel(PerfilExamen.name)
    private readonly perfilModel: Model<PerfilExamenDocument>,
  ) {}

  // ========================================
  // ✅ CREAR PERFIL (POR EMPRESA)
  // ========================================
  async create(data: CreatePerfilExamenDto) {
    try {
      const perfil = await this.perfilModel.create({
        puesto: data.puesto,          // ✅ UNIFICADO
        estudios: data.estudios,
        empresa: data.empresaId,
        activo: true,
      });

      return perfil;
    } catch (error: any) {
      console.error('ERROR CREANDO PERFIL:', error);

      // ✅ DUPLICADO (empresa + puesto)
      if (error?.code === 11000) {
        throw new BadRequestException(
          'Ya existe un perfil con ese puesto para esta empresa',
        );
      }

      // ✅ VALIDACIÓN MONGOOSE
      if (error?.name === 'ValidationError') {
        throw new BadRequestException('Datos inválidos para crear el perfil');
      }

      throw new BadRequestException('No se pudo crear el perfil');
    }
  }

  // ========================================
  // ✅ LISTAR TODOS (DEBUG / SUPERADMIN)
  // ========================================
  async findAll() {
  return this.perfilModel
    .find()
    .populate('empresa', 'razonSocial numeroCliente') // ⬅️ ACA ESTÁ LA SOLUCIÓN
    .sort({ puesto: 1 });
}


  // ========================================
  // ✅ LISTAR PERFILES POR EMPRESA
  // ========================================
  async getByEmpresa(empresaId: string) {
    return this.perfilModel
      .find({ empresa: empresaId })
      .sort({ puesto: 1 });
  }

  // ========================================
  // ✅ BUSCAR PERFIL POR PUESTO + EMPRESA
  // ========================================
  async getByPuesto(empresaId: string, puesto: string) {
    const perfil = await this.perfilModel.findOne({
      empresa: empresaId,
      puesto,
      activo: true,
    });

    if (!perfil) {
      throw new NotFoundException(
        'No existe perfil para ese puesto en esta empresa',
      );
    }

    return perfil;
  }

  // ========================================
  // ✅ BUSCAR PERFIL POR ID
  // ========================================
  async findOne(id: string) {
    const perfil = await this.perfilModel
      .findById(id)
      .populate('empresa', 'razonSocial');

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return perfil;
  }

  // ========================================
// ✅ EDITAR PERFIL (LIMPIANDO _id DE ESTUDIOS)
// ========================================
async update(id: string, data: UpdatePerfilExamenDto) {
  try {
    // 🔥 LIMPIAR _id DE LOS ESTUDIOS PARA EVITAR ERROR 400
    const estudiosLimpios = data.estudios
      ? data.estudios.map(e => ({
          nombre: e.nombre,
          sector: e.sector,
        }))
      : undefined;

    const updateData = {
      puesto: data.puesto,
      activo: data.activo,
      ...(estudiosLimpios && { estudios: estudiosLimpios }),
    };

    const perfil = await this.perfilModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return perfil;

  } catch (error: any) {
    console.error('ERROR ACTUALIZANDO PERFIL:', error);

    if (error?.code === 11000) {
      throw new BadRequestException(
        'Ya existe un perfil con ese puesto para esta empresa',
      );
    }

    throw new BadRequestException('No se pudo actualizar el perfil');
  }
}


  // ========================================
  // ✅ ELIMINAR PERFIL (BORRADO FÍSICO)
  // ========================================
  async delete(id: string) {
    const perfil = await this.perfilModel.findByIdAndDelete(id);

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return { message: 'Perfil eliminado correctamente' };
  }

  // ========================================
  // ✅ OPCIONAL: ELIMINADO LÓGICO (DESACTIVAR)
  // ========================================
  async desactivar(id: string) {
    const perfil = await this.perfilModel.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true },
    );

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return perfil;
  }
}
