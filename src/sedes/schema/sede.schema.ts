import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SedeDocument = Sede & Document;

@Schema({ timestamps: true })
export class Sede {
  // -------------------------
  // Datos principales
  // -------------------------

  @Prop({ required: true, unique: true })
  nombre: string; // Ej: "ASMEL Quilmes"

  // -------------------------
  // Ubicación
  // -------------------------

  @Prop({ required: true })
  provincia: string;

  @Prop({ required: true })
  partido: string;

  @Prop({ required: true })
  localidad: string;

  @Prop({ required: true })
  direccion: string;

  // -------------------------
  // Contacto
  // -------------------------

  @Prop({ required: true })
  telefono1: string;

  @Prop()
  telefono2?: string;

  // -------------------------
  // Horarios
  // -------------------------

  @Prop({ required: true })
  horarios: string;

  // -------------------------
  // Estado
  // -------------------------

  @Prop({ default: true })
  activa: boolean;
}

export const SedeSchema = SchemaFactory.createForClass(Sede);
