import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PerfilExamenDocument = PerfilExamen & Document;

@Schema({ timestamps: true })
export class PerfilExamen {
  // =========================
  // PUESTO
  // =========================
  @Prop({ required: true, trim: true })
  puesto: string;

  // =========================
  // TIPO DE EXAMEN
  // =========================
  @Prop({
    required: true,
    enum: ['ingreso', 'periodico', 'egreso'],
    index: true,
  })
  tipo: 'ingreso' | 'periodico' | 'egreso';

  // =========================
  // PRÁCTICAS ASOCIADAS (CÓDIGOS)
  // =========================
  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  practicasPerfil: string[]; // ['100','400','503']

  // =========================
  // EMPRESA
  // =========================
  @Prop({
    type: Types.ObjectId,
    ref: 'Empresa',
    required: true,
    index: true,
  })
  empresa: Types.ObjectId;

  // =========================
  // ESTADO
  // =========================
  @Prop({ default: true, index: true })
  activo: boolean;
}

export const PerfilExamenSchema =
  SchemaFactory.createForClass(PerfilExamen);
