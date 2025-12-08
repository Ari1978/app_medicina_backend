import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PerfilExamen } from './schemas/perfil-examen.schema';
import { CreatePerfilExamenDto } from './dto/create-perfil-examen.dto';
import { UpdatePerfilExamenDto } from './dto/update-perfil-examen.dto';

@Injectable()
export class PerfilExamenService {
  constructor(
    @InjectModel(PerfilExamen.name)
    private readonly perfilModel: Model<PerfilExamen>,
  ) {}

  // ========================================
  // ✅ CREAR PERFIL (POR EMPRESA)
  // ========================================
  async create(data: CreatePerfilExamenDto) {
    try {
      return await this.perfilModel.create({
        nombre: data.puesto,      // ✅ se guarda como nombre
        estudios: data.estudios,
        empresa: data.empresaId,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException(
          'Ya existe un perfil con ese puesto para esta empresa',
        );
      }

      throw error;
    }
  }

  // ========================================
  // ✅ LISTAR TODOS (SOLO DEBUG/SUPERADMIN)
  // ========================================
  async findAll() {
    return this.perfilModel
      .find()
      .populate('empresa', 'razonSocial')
      .sort({ nombre: 1 });
  }

  // ========================================
  // ✅ LISTAR PERFILES POR EMPRESA
  // ========================================
  async getByEmpresa(empresaId: string) {
    return this.perfilModel
      .find({ empresa: empresaId })
      .sort({ nombre: 1 });
  }

  // ========================================
  // ✅ BUSCAR PERFIL POR PUESTO + EMPRESA
  // ========================================
  async getByPuesto(empresaId: string, puesto: string) {
    const perfil = await this.perfilModel.findOne({
      empresa: empresaId,
      nombre: puesto,
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
  // ✅ EDITAR PERFIL
  // ========================================
  async update(id: string, data: UpdatePerfilExamenDto) {
    const perfil = await this.perfilModel.findByIdAndUpdate(
      id,
      data,
      { new: true },
    );

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return perfil;
  }

  // ========================================
  // ✅ ELIMINAR PERFIL
  // ========================================
  async delete(id: string) {
    const perfil = await this.perfilModel.findByIdAndDelete(id);

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return { message: 'Perfil eliminado correctamente' };
  }
}
