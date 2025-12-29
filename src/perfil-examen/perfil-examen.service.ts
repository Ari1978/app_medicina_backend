import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  PerfilExamen,
  PerfilExamenDocument,
} from './schemas/perfil-examen.schema';

import { CreatePerfilExamenDto } from './dto/create-perfil-examen.dto';
import { UpdatePerfilExamenDto } from './dto/update-perfil-examen.dto';
import { PerfilExamenLean } from './perfil-examen.types';

import { CATALOGO_PRACTICAS } from '../practicas/practicas.catalog';

@Injectable()
export class PerfilExamenService {
  constructor(
    @InjectModel(PerfilExamen.name)
    private readonly model: Model<PerfilExamenDocument>,
  ) {}

  // ============================================================
  // VALIDAR CÓDIGOS DE PRÁCTICAS
  // ============================================================
  private validarCodigos(codigos: string[]) {
    if (!Array.isArray(codigos)) {
      throw new BadRequestException(
        'Las prácticas deben ser un array',
      );
    }

    for (const codigo of codigos) {
      const existe = CATALOGO_PRACTICAS.some(
        (p) => p.codigo === codigo,
      );

      if (!existe) {
        throw new BadRequestException(
          `Código de práctica inválido: ${codigo}`,
        );
      }
    }
  }

  // ============================================================
  // HIDRATAR PRÁCTICAS (CATÁLOGO → OBJETOS)
  // ============================================================
  private hidratarPracticas(codigos?: string[]) {
    if (!Array.isArray(codigos)) return [];

    return codigos
      .map((codigo) =>
        CATALOGO_PRACTICAS.find((p) => p.codigo === codigo),
      )
      .filter(Boolean);
  }

  // ============================================================
  // EMPRESA → VER PERFILES
  // ============================================================
  async findByEmpresa(empresaId: string) {
    const perfiles = await this.model
      .find({
        empresa: new Types.ObjectId(empresaId),
        activo: true,
      })
      .populate('empresa', 'razonSocial numeroCliente')
      .sort({ createdAt: -1 })
      .lean<PerfilExamenLean[]>();

    return perfiles.map((p) => ({
      ...p,
      practicas: this.hidratarPracticas(p.practicasPerfil),
    }));
  }

  // ============================================================
  // STAFF → VER TODOS
  // ============================================================
  async findAllStaff() {
    const perfiles = await this.model
      .find({ activo: true })
      .populate('empresa', 'razonSocial numeroCliente')
      .sort({ createdAt: -1 })
      .lean<PerfilExamenLean[]>();

    return perfiles.map((p) => ({
      ...p,
      practicas: this.hidratarPracticas(p.practicasPerfil),
    }));
  }

  // ============================================================
  // STAFF → VER UNO
  // ============================================================
  async findById(id: string) {
    const perfil = await this.model
      .findById(id)
      .populate('empresa', 'razonSocial numeroCliente')
      .lean<PerfilExamenLean>();

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return {
      ...perfil,
      practicas: this.hidratarPracticas(perfil.practicasPerfil),
    };
  }

  // ============================================================
  // STAFF → CREAR PERFIL
  // ============================================================
  async createForEmpresa(dto: CreatePerfilExamenDto) {
    this.validarCodigos(dto.practicasPerfil);

    return this.model.create({
      puesto: dto.puesto.trim(),
      tipo: dto.tipo,
      practicasPerfil: dto.practicasPerfil,
      empresa: new Types.ObjectId(dto.empresaId),
      activo: true,
    });
  }

  // ============================================================
  // STAFF → EDITAR PERFIL
  // ============================================================
  async update(id: string, dto: UpdatePerfilExamenDto) {
    if (dto.practicasPerfil) {
      this.validarCodigos(dto.practicasPerfil);
    }

    const perfil = await this.model
      .findByIdAndUpdate(
        id,
        {
          ...(dto.puesto !== undefined && { puesto: dto.puesto }),
          ...(dto.tipo !== undefined && { tipo: dto.tipo }),
          ...(dto.practicasPerfil !== undefined && {
            practicasPerfil: dto.practicasPerfil,
          }),
        },
        { new: true },
      )
      .lean<PerfilExamenLean>();

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return {
      ...perfil,
      practicas: this.hidratarPracticas(perfil.practicasPerfil),
    };
  }

  // ============================================================
  // STAFF → ELIMINAR (BORRADO LÓGICO)
  // ============================================================
  async delete(id: string) {
    const perfil = await this.model.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true },
    );

    if (!perfil) {
      throw new NotFoundException('Perfil no encontrado');
    }

    return { ok: true };
  }
}
