import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

export type PerfilExamenDocument = PerfilExamen & Document;

@Schema({ timestamps: true })
export class PerfilExamen {

  // ✅ ESTE ES EL ÚNICO CAMPO DE NOMBRE
  @Prop({ required: true })
  nombre: string;

  // ✅ Estudios con sector
  @Prop({
    type: [
      {
        nombre: { type: String, required: true },
        sector: { type: String, required: true },
      },
    ],
    default: [],
  })
  estudios: {
    nombre: string;
    sector: string;
  }[];

  // ✅ Empresa
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
  })
  empresa: any;

  // ✅ Auditoría
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StaffUser',
    required: false,
  })
  creadoPor: any;

  // ✅ Estado
  @Prop({ default: true })
  activo: boolean;
}

export const PerfilExamenSchema =
  SchemaFactory.createForClass(PerfilExamen);

// ✅ Índice único por empresa + nombre
PerfilExamenSchema.index(
  { empresa: 1, nombre: 1 },
  { unique: true },
);
