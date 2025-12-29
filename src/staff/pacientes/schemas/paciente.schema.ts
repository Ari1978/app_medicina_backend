import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PacienteDocument = Paciente & Document;

@Schema({ timestamps: true })
export class Paciente {
  // =========================
  // VÍNCULO CON EMPRESA (opcional)
  // =========================
  @Prop({ type: Types.ObjectId, ref: 'Empresa', required: false })
  empresa?: Types.ObjectId;

  // =========================
  // DATOS PERSONALES
  // =========================
  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, trim: true })
  nombre: string;

  // DNI como string (mejor para ceros, formatos, etc.)
  @Prop({ required: true, trim: true, unique: true, index: true })
  dni: string;

  @Prop({ trim: true, default: '' })
  estadoCivil?: string;

  // yyyy-mm-dd
  @Prop({ trim: true, default: '' })
  fechaNacimiento?: string;

  // yyyy-mm-dd
  @Prop({ trim: true, default: '' })
  fechaIngreso?: string;

  // =========================
  // LABORAL
  // =========================
  @Prop({ trim: true, default: '' })
  puesto?: string;

  @Prop({ trim: true, default: '' })
  horario?: string;

  // =========================
  // DOMICILIO
  // =========================
  @Prop({ trim: true, default: '' })
  direccion?: string;

  @Prop({ trim: true, default: '' })
  entreCalles?: string;

  @Prop({ trim: true, default: '' })
  localidad?: string;

  @Prop({ trim: true, default: '' })
  partido?: string;

  @Prop({ trim: true, default: '' })
  provincia?: string;

  // =========================
  // CONTACTO
  // =========================
  @Prop({ trim: true, default: '' })
  telefono?: string;

  // =========================
  // OTROS
  // =========================
  @Prop({ trim: true, default: '' })
  otros?: string;

  // =========================
  // ESTADO
  // =========================
  @Prop({ default: true })
  activo: boolean;
}

export const PacienteSchema = SchemaFactory.createForClass(Paciente);

// Index explícito (además de unique:true) para performance
PacienteSchema.index({ dni: 1 }, { unique: true });
